/* @license Enterprise */

import {
  type RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveDefaultGeneralAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-default-general-access-level.util';

// Everyone rows written by a rule or an application are not part of the
// general access people set on the record
export const resolveRecordGeneralAccessLevel = ({
  sharingMode,
  recordShares,
}: {
  sharingMode: RecordSharingMode;
  recordShares: RecordShare[];
}): RecordShareAccessLevel | null => {
  const defaultGeneralAccessLevel =
    resolveDefaultGeneralAccessLevel(sharingMode);

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
