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
  if (sharingMode === RecordSharingMode.ROLE_ONLY) {
    return null;
  }

  const defaultGeneralAccessLevel =
    resolveDefaultGeneralAccessLevel(sharingMode);
  const shareWithToWrite = (shareWith ?? []).filter(
    (shareWithEntry) =>
      shareWithEntry.everyone !== true ||
      shareWithEntry.accessLevel !== defaultGeneralAccessLevel,
  );

  switch (sharingMode) {
    case RecordSharingMode.OPEN_BY_DEFAULT:
      return isNonEmptyArray(shareWithToWrite) ? shareWithToWrite : null;
    case RecordSharingMode.PRIVATE:
    case RecordSharingMode.INHERITED:
      return shareWithToWrite;
    default:
      return assertUnreachable(sharingMode);
  }
};
