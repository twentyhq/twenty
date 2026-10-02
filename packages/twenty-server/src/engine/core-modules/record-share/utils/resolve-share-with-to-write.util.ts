/* @license Enterprise */

import { assertUnreachable, isNonEmptyArray } from 'twenty-shared/utils';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';

// Null when the created records get no share row. shareWith also reaches the
// records created through nested relations, so an object whose records are
// not shared writes nothing, and records open by default skip everyone, who
// already holds their general access
export const resolveShareWithToWrite = ({
  sharingMode,
  shareWith,
}: {
  sharingMode: RecordSharingMode;
  shareWith?: ShareWithInput[] | null;
}): ShareWithInput[] | null => {
  switch (sharingMode) {
    case RecordSharingMode.NONE:
      return null;
    case RecordSharingMode.OPEN_BY_DEFAULT: {
      const grants = (shareWith ?? []).filter(
        (shareWithEntry) => shareWithEntry.everyone !== true,
      );

      return isNonEmptyArray(grants) ? grants : null;
    }
    case RecordSharingMode.PRIVATE:
    case RecordSharingMode.INHERITED:
      return shareWith ?? [];
    default:
      return assertUnreachable(sharingMode);
  }
};
