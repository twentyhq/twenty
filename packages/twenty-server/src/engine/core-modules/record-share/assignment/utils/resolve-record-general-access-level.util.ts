/* @license Enterprise */

import {
  type RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';

// Everyone rows written by a rule or an application are not part of the
// general access people set on the record
export const resolveRecordGeneralAccessLevel = ({
  defaultGeneralAccessLevel,
  recordShares,
}: {
  defaultGeneralAccessLevel: RecordShareAccessLevel | null;
  recordShares: RecordShare[];
}): RecordShareAccessLevel | null => {
  if (!isDefined(defaultGeneralAccessLevel)) {
    return null;
  }

  const everyoneManualShare = recordShares.find(
    (recordShare) =>
      recordShare.principalType === RecordSharePrincipalType.EVERYONE &&
      recordShare.rowCause === RecordShareRowCause.MANUAL,
  );

  return everyoneManualShare?.accessLevel ?? defaultGeneralAccessLevel;
};
