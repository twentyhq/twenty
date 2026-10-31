/* @license Enterprise */

import {
  RecordShareAccessLevel,
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
  isPrivate,
}: {
  defaultGeneralAccessLevel: RecordShareAccessLevel | null;
  recordShares: RecordShare[];
  isPrivate: boolean;
}): RecordShareAccessLevel | null => {
  if (!isDefined(defaultGeneralAccessLevel)) {
    return null;
  }

  if (isPrivate) {
    return RecordShareAccessLevel.NONE;
  }

  const everyoneManualShare = recordShares.find(
    (recordShare) =>
      recordShare.principalType === RecordSharePrincipalType.EVERYONE &&
      recordShare.rowCause === RecordShareRowCause.MANUAL,
  );

  return everyoneManualShare?.accessLevel ?? defaultGeneralAccessLevel;
};
