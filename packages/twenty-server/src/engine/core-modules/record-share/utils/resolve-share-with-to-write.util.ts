/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { type ObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';

// Null when the created records get no share row. shareWith also reaches the
// records created through nested relations, so an object whose records are
// only shared through roles writes nothing. Everyone at the default level is
// the absence of a row, as for setRecordGeneralAccess
export const resolveShareWithToWrite = ({
  objectSharing: { isShareable, isShareRequired, defaultGeneralAccessLevel },
  shareWith,
}: {
  objectSharing: Pick<
    ObjectSharing,
    'isShareable' | 'isShareRequired' | 'defaultGeneralAccessLevel'
  >;
  shareWith?: ShareWithInput[] | null;
}): ShareWithInput[] | null => {
  if (!isShareable) {
    return null;
  }

  const shareWithToWrite = (shareWith ?? []).filter(
    (shareWithEntry) =>
      shareWithEntry.everyone !== true ||
      shareWithEntry.accessLevel !== defaultGeneralAccessLevel,
  );

  if (isShareRequired) {
    return shareWithToWrite;
  }

  return isNonEmptyArray(shareWithToWrite) ? shareWithToWrite : null;
};
