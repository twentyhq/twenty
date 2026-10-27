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

// Records open by default stay open unless one restricts the subject
export const buildRecordShareGate = (
  { subject, environment }: RowAccessPolicyContext,
  { tableAlias, flatObjectMetadata, operationType }: RowAccessPolicyTarget,
): RowAccessPolicy => {
  const { sharingMode } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  });

  if (
    sharingMode !== RecordSharingMode.OPEN_BY_DEFAULT ||
    subject.canAccessAllRecords ||
    !isDefined(subject.principalIds)
  ) {
    return { kind: 'open' };
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: 'recordNotRestricted',
      tableAlias,
      objectMetadataId: flatObjectMetadata.id,
      principalIds: subject.principalIds,
      accessLevels,
    },
  };
};
