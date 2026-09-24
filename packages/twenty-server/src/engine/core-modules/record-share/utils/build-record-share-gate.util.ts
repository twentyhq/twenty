import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/core-modules/record-share/constants/max-inherited-readability-depth.constant';
import { type InheritedReadabilityParent } from 'src/engine/core-modules/record-share/types/inherited-readability-parent.type';
import {
  buildInheritedReadabilityCondition,
  type InheritedReadabilityParentCondition,
} from 'src/engine/core-modules/record-share/utils/build-inherited-readability-condition.util';
import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
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
    isLegacyRecordAccessOpen: context.environment.isLegacyRecordAccessOpen,
  });
  switch (gateKind) {
    case 'open':
      return { kind: 'open' };
    case 'deny':
      return { kind: 'denied' };
    case 'inherited':
      return buildInheritedReadabilityGate({
        context,
        target,
        buildParentPolicy,
      });
    case 'private':
      return buildOwnRecordShareGate(context, target);
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
    condition: buildRecordShareCondition({
      tableAlias: target.tableAlias,
      recordShareTableExpression:
        context.environment.recordShareTableExpression,
      objectMetadataId: target.flatObjectMetadata.id,
      ...principals,
    }),
  };
};

const buildInheritedReadabilityGate = ({
  context,
  target,
  buildParentPolicy,
}: RecordShareGateArgs): RowAccessPolicy => {
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

  if (parents.length === 0) {
    return buildOwnRecordShareGate(context, target);
  }

  const principals = resolveRecordSharePrincipals(context, target);

  if (!isDefined(principals)) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    condition: buildInheritedReadabilityCondition({
      tableAlias,
      objectMetadataId: flatObjectMetadata.id,
      parents: parents.map((parent) =>
        buildInheritedReadabilityParentCondition({
          context,
          target,
          parent,
          buildParentPolicy,
        }),
      ),
      recordShareTableExpression:
        context.environment.recordShareTableExpression,
      ...principals,
    }),
  };
};

const buildInheritedReadabilityParentCondition = ({
  context,
  target: { tableAlias, operationType, depth },
  parent,
  buildParentPolicy,
}: RecordShareGateArgs & {
  parent: InheritedReadabilityParent;
}): InheritedReadabilityParentCondition => {
  if (parent.kind === 'column') {
    const parentTableAlias = `${tableAlias}_${parent.joinColumnName}`;

    return {
      kind: 'column',
      joinColumnName: parent.joinColumnName,
      parentTableAlias,
      parentTableExpression: context.environment.resolveTableExpression(
        parent.parentFlatObjectMetadata.id,
      ),
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
    childTableExpression: context.environment.resolveTableExpression(
      parent.childFlatObjectMetadata.id,
    ),
    childJoinColumnName: parent.childJoinColumnName,
    policy: buildParentPolicy({
      tableAlias: childTableAlias,
      flatObjectMetadata: parent.childFlatObjectMetadata,
      operationType,
      depth: depth + 1,
    }),
  };
};
