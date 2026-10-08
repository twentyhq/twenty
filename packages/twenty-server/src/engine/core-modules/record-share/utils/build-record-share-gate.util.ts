/* @license Enterprise */

import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/core-modules/record-share/constants/max-inherited-readability-depth.constant';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type InheritedReadabilityParent } from 'src/engine/core-modules/record-share/types/inherited-readability-parent.type';
import { isOpenWhenDetachedObject } from 'src/engine/core-modules/record-share/utils/is-open-when-detached-object.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
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

  const gateKind = resolveRecordShareGateKind({
    readability: target.flatObjectMetadata.readability,
    isOwningApplication,
  });
  const { sharingMode, isVisibilityGatingEnabled } = resolveObjectSharing({
    flatObjectMetadata: target.flatObjectMetadata,
    featureFlagsMap: context.environment.featureFlagsMap,
  });

  switch (gateKind) {
    case 'open':
      return isVisibilityGatingEnabled &&
        sharingMode === RecordSharingMode.OPEN_BY_DEFAULT &&
        !context.subject.canAccessAllRecords
        ? buildRecordShareExceptionGate(context, target)
        : { kind: 'open' };
    case 'deny':
      return { kind: 'denied' };
    case 'inherited':
      return buildInheritedReadabilityGate({
        context,
        target,
        buildParentPolicy,
        isVisibilityGatingEnabled,
      });
    case 'private':
      return isVisibilityGatingEnabled
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
  isVisibilityGatingEnabled,
}: RecordShareGateArgs & {
  isVisibilityGatingEnabled: boolean;
}): RowAccessPolicy => {
  const { tableAlias, flatObjectMetadata, depth, joinParentRelationShape } =
    target;

  if (depth > MAX_INHERITED_READABILITY_DEPTH) {
    return { kind: 'denied' };
  }

  const parents = resolveInheritedReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps: context.environment.flatFieldMetadataMaps,
    flatObjectMetadataMaps: context.environment.flatObjectMetadataMaps,
  });

  if (
    isDefined(joinParentRelationShape) &&
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
    return isOpenWhenDetached || !isVisibilityGatingEnabled
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
    !isVisibilityGatingEnabled &&
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
  target: { tableAlias, operationType, depth },
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
    }),
  };
};
