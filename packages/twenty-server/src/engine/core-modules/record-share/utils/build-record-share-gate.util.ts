/* @license Enterprise */

import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/core-modules/record-share/constants/max-inherited-readability-depth.constant';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type InheritedReadabilityChildrenParent } from 'src/engine/core-modules/record-share/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityParent } from 'src/engine/core-modules/record-share/types/inherited-readability-parent.type';
import { isOpenWhenDetachedObject } from 'src/engine/core-modules/record-share/utils/is-open-when-detached-object.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolveReadabilityWithInheritanceRules } from 'src/engine/core-modules/record-share/utils/resolve-readability-with-inheritance-rules.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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

  const { readability } = resolveReadabilityWithInheritanceRules({
    flatObjectMetadata: target.flatObjectMetadata,
    flatRecordInheritanceRuleMaps:
      context.environment.flatRecordInheritanceRuleMaps,
  });
  const gateKind = resolveRecordShareGateKind({
    readability,
    isOwningApplication,
  });
  const { sharingMode } = resolveObjectSharing({
    flatObjectMetadata: target.flatObjectMetadata,
    featureFlagsMap: context.environment.featureFlagsMap,
    flatRecordInheritanceRuleMaps:
      context.environment.flatRecordInheritanceRuleMaps,
  });

  switch (gateKind) {
    case 'open':
      return sharingMode === RecordSharingMode.OPEN_BY_DEFAULT &&
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
  const { tableAlias, flatObjectMetadata, depth, joinParentRelationShape } =
    target;

  if (depth > MAX_INHERITED_READABILITY_DEPTH) {
    return { kind: 'denied' };
  }

  const parents = resolveInheritedReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps: context.environment.flatFieldMetadataMaps,
    flatObjectMetadataMaps: context.environment.flatObjectMetadataMaps,
    flatRecordInheritanceRuleMaps:
      context.environment.flatRecordInheritanceRuleMaps,
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

  const isOpenWhenDetached =
    isOpenWhenDetachedObject(flatObjectMetadata) ||
    resolveReadabilityWithInheritanceRules({
      flatObjectMetadata,
      flatRecordInheritanceRuleMaps:
        context.environment.flatRecordInheritanceRuleMaps,
    }).isOpenWhenDetached;

  if (parents.length === 0) {
    return isOpenWhenDetached
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
      accessLevels: principals.accessLevels,
      buildParentPolicy,
    }),
  );

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
  accessLevels,
  buildParentPolicy,
}: RecordShareGateArgs & {
  parent: InheritedReadabilityParent;
  accessLevels: RecordShareAccessLevel[];
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

  if (isDefined(parent.junctionParent)) {
    return {
      kind: 'children',
      childTableAlias: `${childTableAlias}_${parent.junctionParent.joinColumnName}`,
      childJoinColumnName: parent.childJoinColumnName,
      childParentJoinColumnName: parent.junctionParent.joinColumnName,
      childFlatObjectMetadata: parent.childFlatObjectMetadata,
      policy: buildJunctionPolicy({
        junctionTableAlias: `${childTableAlias}_${parent.junctionParent.joinColumnName}`,
        junctionFlatObjectMetadata: parent.childFlatObjectMetadata,
        junctionParent: parent.junctionParent,
        accessLevels,
        operationType,
        depth,
        buildParentPolicy,
      }),
    };
  }

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

// Only the linked parent decides, the junction's own readability and shares do not
const buildJunctionPolicy = ({
  junctionTableAlias,
  junctionFlatObjectMetadata,
  junctionParent,
  accessLevels,
  operationType,
  depth,
  buildParentPolicy,
}: {
  junctionTableAlias: string;
  junctionFlatObjectMetadata: Pick<FlatObjectMetadata, 'id'>;
  junctionParent: NonNullable<
    InheritedReadabilityChildrenParent['junctionParent']
  >;
  accessLevels: RecordShareAccessLevel[];
  operationType: RowAccessPolicyTarget['operationType'];
  depth: number;
  buildParentPolicy: BuildParentPolicy;
}): RowAccessPolicy => {
  const parentTableAlias = `${junctionTableAlias}_parent`;
  const parentPolicy = buildParentPolicy({
    tableAlias: parentTableAlias,
    flatObjectMetadata: junctionParent.parentFlatObjectMetadata,
    operationType,
    depth: depth + 2,
  });

  if (parentPolicy.kind === 'denied') {
    return { kind: 'denied' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: 'inheritedReadability',
      tableAlias: junctionTableAlias,
      objectMetadataId: junctionFlatObjectMetadata.id,
      principalIds: [],
      accessLevels,
      isOpenWhenDetached: false,
      parents: [
        {
          kind: 'column',
          joinColumnName: junctionParent.joinColumnName,
          parentTableAlias,
          parentFlatObjectMetadata: junctionParent.parentFlatObjectMetadata,
          policy: parentPolicy,
        },
      ],
    },
  };
};
