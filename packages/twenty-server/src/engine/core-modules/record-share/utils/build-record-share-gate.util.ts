/* @license Enterprise */

import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/core-modules/record-share/constants/max-inherited-readability-depth.constant';
import { type InheritedReadabilityParent } from 'src/engine/core-modules/record-share/types/inherited-readability-parent.type';
import { isDiscoverableObject } from 'src/engine/core-modules/record-share/utils/is-discoverable-object.util';
import { isOpenWhenDetachedObject } from 'src/engine/core-modules/record-share/utils/is-open-when-detached-object.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { shouldEnforceRecordShareExceptions } from 'src/engine/core-modules/record-share/utils/should-enforce-record-share-exceptions.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type InheritedReadabilityParentExpression,
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

type BuildParentPolicy = (target: RowAccessPolicyTarget) => RowAccessPolicy;

type RecordShareGateArgs = {
  context: RowAccessPolicyContext;
  target: RowAccessPolicyTarget;
  buildParentPolicy: BuildParentPolicy;
};

export const buildRecordShareGate = ({
  context,
  target,
  buildParentPolicy,
}: RecordShareGateArgs): RowAccessPolicy => {
  const isOwningApplication = context.subject.isOwningApplication(
    target.flatObjectMetadata,
  );

  // Resolved on the queried record and handed down its inheritance chain, so a
  // parent is only discoverable through a child that is itself discoverable.
  const isExistenceRead =
    target.isExistenceRead ??
    (context.subject.readScope === 'existence' &&
      target.operationType === 'select' &&
      isDiscoverableObject(target.flatObjectMetadata));

  const gateKind = resolveRecordShareGateKind({
    readability: target.flatObjectMetadata.readability,
    isOwningApplication,
    isExistenceRead,
  });
  const isGatingEnabled =
    context.environment.isRecordShareVisibilityGatingEnabled;

  switch (gateKind) {
    case 'open':
      return isGatingEnabled &&
        shouldEnforceRecordShareExceptions({
          flatObjectMetadata: target.flatObjectMetadata,
          isRecordSharingEnabled: context.environment.isRecordSharingEnabled,
          canAccessAllRecords: context.subject.canAccessAllRecords,
        })
        ? buildRecordShareExceptionGate(context, target)
        : { kind: 'open' };
    case 'deny':
      return { kind: 'denied' };
    case 'inherited':
      return buildInheritedReadabilityGate({
        context,
        target: { ...target, isExistenceRead },
        buildParentPolicy,
      });
    case 'private':
      // Email and calendar privacy predates record sharing, so the gating
      // switch must not expose them
      return isGatingEnabled || isDiscoverableObject(target.flatObjectMetadata)
        ? buildOwnRecordShareGate(context, target)
        : { kind: 'open' };
    default:
      return assertUnreachable(gateKind);
  }
};

const resolveRecordSharePrincipals = (
  { subject }: RowAccessPolicyContext,
  { operationType }: RowAccessPolicyTarget,
):
  | { principalIds: string[]; accessLevels: RecordShareAccessLevel[] }
  | undefined => {
  if (!isDefined(subject.principalIds)) {
    return undefined;
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return undefined;
  }

  return { principalIds: subject.principalIds, accessLevels };
};

const buildOwnRecordShareGate = (
  context: RowAccessPolicyContext,
  target: RowAccessPolicyTarget,
): RowAccessPolicy => {
  const principals = resolveRecordSharePrincipals(context, target);

  if (!isDefined(principals)) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: 'recordShared',
      tableAlias: target.tableAlias,
      objectMetadataId: target.flatObjectMetadata.id,
      ...principals,
    },
  };
};

const buildRecordShareExceptionGate = (
  context: RowAccessPolicyContext,
  target: RowAccessPolicyTarget,
): RowAccessPolicy => {
  const principals = resolveRecordSharePrincipals(context, target);

  if (!isDefined(principals)) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: 'recordNotRestricted',
      tableAlias: target.tableAlias,
      objectMetadataId: target.flatObjectMetadata.id,
      ...principals,
    },
  };
};

const buildInheritedReadabilityGate = ({
  context,
  target,
  buildParentPolicy,
}: RecordShareGateArgs): RowAccessPolicy => {
  const isGatingEnabled =
    context.environment.isRecordShareVisibilityGatingEnabled;
  const {
    tableAlias,
    flatObjectMetadata,
    depth,
    joinParentRelationShape,
    isExistenceRead,
  } = target;

  if (depth > MAX_INHERITED_READABILITY_DEPTH) {
    return { kind: 'denied' };
  }

  const parents = resolveInheritedReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps: context.environment.flatFieldMetadataMaps,
    flatObjectMetadataMaps: context.environment.flatObjectMetadataMaps,
  });

  // A parent joined in an existence read was admitted without a grant, which
  // only a child that is itself discoverable may rely on
  if (
    isDefined(joinParentRelationShape) &&
    (context.subject.readScope !== 'existence' || isExistenceRead) &&
    parents.some(
      (parent) =>
        parent.kind === 'column' &&
        parent.fieldMetadataId ===
          joinParentRelationShape.targetFieldMetadataId,
    )
  ) {
    return { kind: 'open' };
  }

  const isOpenWhenDetached = isOpenWhenDetachedObject(flatObjectMetadata);

  if (parents.length === 0) {
    return isOpenWhenDetached || !isGatingEnabled
      ? { kind: 'open' }
      : buildOwnRecordShareGate(context, target);
  }

  const principals = resolveRecordSharePrincipals(context, target);

  if (!isDefined(principals)) {
    return { kind: 'open' };
  }

  const parentExpressions = parents.map((parent) =>
    buildInheritedReadabilityParentExpression({
      context,
      target,
      parent,
      buildParentPolicy,
    }),
  );

  if (
    !isGatingEnabled &&
    parentExpressions.every(
      (parentExpression) => parentExpression.policy.kind === 'open',
    )
  ) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: 'inheritedReadability',
      tableAlias,
      objectMetadataId: flatObjectMetadata.id,
      ...principals,
      isOpenWhenDetached,
      parents: parentExpressions,
    },
  };
};

const buildInheritedReadabilityParentExpression = ({
  target: { tableAlias, operationType, depth, isExistenceRead },
  parent,
  buildParentPolicy,
}: RecordShareGateArgs & {
  parent: InheritedReadabilityParent;
}): InheritedReadabilityParentExpression => {
  if (parent.kind === 'column') {
    const parentTableAlias = `${tableAlias}_${parent.joinColumnName}`;

    return {
      kind: 'column',
      joinColumnName: parent.joinColumnName,
      parentTableAlias,
      parentFlatObjectMetadata: parent.parentFlatObjectMetadata,
      policy: buildParentPolicy({
        tableAlias: parentTableAlias,
        flatObjectMetadata: parent.parentFlatObjectMetadata,
        operationType,
        depth: depth + 1,
        isExistenceRead,
      }),
    };
  }

  const childTableAlias = `${tableAlias}_${parent.childFlatObjectMetadata.nameSingular}`;

  return {
    kind: 'children',
    childTableAlias,
    childJoinColumnName: parent.childJoinColumnName,
    childFlatObjectMetadata: parent.childFlatObjectMetadata,
    policy: buildParentPolicy({
      tableAlias: childTableAlias,
      flatObjectMetadata: parent.childFlatObjectMetadata,
      operationType,
      depth: depth + 1,
      isExistenceRead,
    }),
  };
};
