/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolvePrivateReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-private-readability-parents.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildRecordShareGate = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
  operationType,
}: RowAccessPolicyContext &
  Pick<
    RowAccessPolicyTarget,
    'tableAlias' | 'flatObjectMetadata' | 'operationType'
  >): RowAccessPolicy => {
  const { sharingMode } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  });

  const isPrivate =
    sharingMode === RecordSharingMode.PRIVATE &&
    !subject.isOwningApplication(flatObjectMetadata);

  const isOwnRecordGated =
    isPrivate ||
    (sharingMode === RecordSharingMode.OPEN_BY_DEFAULT &&
      !subject.canAccessAllRecords);

  const privateParents = resolvePrivateReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    flatObjectMetadataMaps: environment.flatObjectMetadataMaps,
  }).filter(
    (parent) => !subject.isOwningApplication(parent.parentFlatObjectMetadata),
  );

  if (!isOwnRecordGated && privateParents.length === 0) {
    return { kind: 'open' };
  }

  if (!isDefined(subject.principalIds)) {
    return { kind: 'open' };
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return { kind: 'open' };
  }

  const principals = { principalIds: subject.principalIds, accessLevels };

  const ownRecordExpressions: RowAccessExpression[] = isOwnRecordGated
    ? [
        {
          kind: isPrivate ? 'recordShared' : 'recordNotRestricted',
          tableAlias,
          objectMetadataId: flatObjectMetadata.id,
          ...principals,
        },
      ]
    : [];
  const parentExpressions = privateParents.map(
    (parent): RowAccessExpression => ({
      kind: 'parentRecordShared',
      tableAlias,
      joinColumnName: parent.joinColumnName,
      objectMetadataId: parent.parentFlatObjectMetadata.id,
      ...principals,
    }),
  );
  const operands = [...ownRecordExpressions, ...parentExpressions];

  return {
    kind: 'gated',
    expression: operands.length === 1 ? operands[0] : { kind: 'and', operands },
  };
};
