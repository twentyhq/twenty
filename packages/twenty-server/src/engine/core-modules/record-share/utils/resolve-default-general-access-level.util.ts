/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';

// Null when records of the object are not shared, so they have no general access
export const resolveDefaultGeneralAccessLevel = (
  sharingMode: RecordSharingMode,
): RecordShareAccessLevel | null => {
  switch (sharingMode) {
    case RecordSharingMode.ROLE_ONLY:
      return null;
    case RecordSharingMode.OPEN_BY_DEFAULT:
      return RecordShareAccessLevel.READ_WRITE;
    case RecordSharingMode.PRIVATE:
    case RecordSharingMode.INHERITED:
      return RecordShareAccessLevel.NONE;
    default:
      return assertUnreachable(sharingMode);
  }
};
