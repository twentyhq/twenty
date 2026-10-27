/* @license Enterprise */

import { assertUnreachable, isNonEmptyArray } from 'twenty-shared/utils';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveDefaultGeneralAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-default-general-access-level.util';

// Null when the created records get no share row. shareWith also reaches the
// records created through nested relations, so an object whose records are
// only shared through roles writes nothing. Everyone at the default level is
// the absence of a row, as for setRecordGeneralAccess
export const resolveShareWithToWrite = ({
  sharingMode,
  shareWith,
}: {
  sharingMode: RecordSharingMode;
  shareWith?: ShareWithInput[] | null;
}): ShareWithInput[] | null => {
  switch (sharingMode) {
    case RecordSharingMode.ROLE_ONLY:
    case RecordSharingMode.PRIVATE:
    case RecordSharingMode.INHERITED:
      return null;
    case RecordSharingMode.OPEN_BY_DEFAULT: {
      const defaultGeneralAccessLevel =
        resolveDefaultGeneralAccessLevel(sharingMode);
      const shareWithToWrite = (shareWith ?? []).filter(
        (shareWithEntry) =>
          shareWithEntry.everyone !== true ||
          shareWithEntry.accessLevel !== defaultGeneralAccessLevel,
      );

      return isNonEmptyArray(shareWithToWrite) ? shareWithToWrite : null;
    }
    default:
      return assertUnreachable(sharingMode);
  }
};
