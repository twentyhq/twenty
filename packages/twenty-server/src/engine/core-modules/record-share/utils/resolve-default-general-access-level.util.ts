/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';

// Null when records of the object are not shared, so they have no general access
export const resolveDefaultGeneralAccessLevel = (
  sharingMode: RecordSharingMode,
): RecordShareAccessLevel | null =>
  sharingMode === RecordSharingMode.OPEN_BY_DEFAULT
    ? RecordShareAccessLevel.READ_WRITE
    : null;
