/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShareGrant } from 'src/engine/core-modules/record-share/types/record-share-grant.type';

export const resolveRecordIdsSharedWithPrincipals = ({
  recordShares,
  principalIds,
  accessLevels,
}: {
  recordShares: RecordShareGrant[];
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
