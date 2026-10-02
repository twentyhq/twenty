/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShareGrant } from 'src/engine/core-modules/record-share/types/record-share-grant.type';
import { resolveNamedPrincipalIds } from 'src/engine/core-modules/record-share/utils/resolve-named-principal-ids.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-shared-with-principals.util';

// Mirrors buildRecordShareExceptionCondition for records already in memory
export const resolveRecordIdsRestrictedForPrincipals = ({
  recordShares,
  principalIds,
  accessLevels,
}: {
  recordShares: RecordShareGrant[];
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): Set<string> => {
  const liftedRecordIds = resolveRecordIdsSharedWithPrincipals({
    recordShares,
    principalIds: resolveNamedPrincipalIds({ principalIds }),
    accessLevels,
  });

  return new Set(
    recordShares
      .filter(
        (recordShare) =>
          recordShare.principalId === EVERYONE_PRINCIPAL_ID &&
          !accessLevels.includes(recordShare.accessLevel) &&
          !liftedRecordIds.has(recordShare.recordId),
      )
      .map((recordShare) => recordShare.recordId),
  );
};
