/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
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

  if (
    !isPrivate &&
    (sharingMode !== RecordSharingMode.OPEN_BY_DEFAULT ||
      subject.canAccessAllRecords)
  ) {
    return { kind: 'open' };
  }

  if (!isDefined(subject.principalIds)) {
    return { kind: 'open' };
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: isPrivate ? 'recordShared' : 'recordNotRestricted',
      tableAlias,
      objectMetadataId: flatObjectMetadata.id,
      principalIds: subject.principalIds,
      accessLevels,
    },
  };
};
