import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';

export const resolveRecordIdsSharedWithPrincipals = ({
  recordShares,
  principalIds,
  accessLevels,
}: {
  recordShares: RecordShare[];
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): Set<string> =>
  new Set(
    recordShares
      .filter(
        (recordShare) =>
          principalIds.includes(recordShare.principalId) &&
          accessLevels.includes(recordShare.accessLevel),
      )
      .map((recordShare) => recordShare.recordId),
  );
