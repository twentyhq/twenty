/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ShareWithInput } from 'src/engine/core-modules/record-share/assignment/types/share-with-input.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { type ObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';

export type CreatedRecordSharing = {
  shareWith: ShareWithInput[];
  isPrivate: boolean;
};

// Null when the created records get no share row and stay public. shareWith
// also reaches the records created through nested relations, so an object
// whose records are only shared through roles writes nothing
export const resolveCreatedRecordSharingOrThrow = ({
  objectSharing: { isShareable, isShareRequired, defaultGeneralAccessLevel },
  shareWith,
}: {
  objectSharing: Pick<
    ObjectSharing,
    'isShareable' | 'isShareRequired' | 'defaultGeneralAccessLevel'
  >;
  shareWith?: ShareWithInput[] | null;
}): CreatedRecordSharing | null => {
  if (!isShareable) {
    return null;
  }

  const entries = shareWith ?? [];

  if (isShareRequired) {
    return {
      shareWith: entries.filter(
        (entry) =>
          entry.everyone !== true ||
          entry.accessLevel !== defaultGeneralAccessLevel,
      ),
      isPrivate: false,
    };
  }

  const everyoneEntries = entries.filter((entry) => entry.everyone === true);

  if (
    everyoneEntries.some(
      (entry) => entry.accessLevel === RecordShareAccessLevel.READ,
    )
  ) {
    throw new RecordShareException(
      'A record is either private or follows the roles of its object',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      { userFriendlyMessage: msg`Invalid access level.` },
    );
  }

  const namedEntries = entries.filter((entry) => entry.everyone !== true);
  const isPrivate = everyoneEntries.some(
    (entry) => entry.accessLevel === RecordShareAccessLevel.NONE,
  );

  return isPrivate || isNonEmptyArray(namedEntries)
    ? { shareWith: namedEntries, isPrivate }
    : null;
};
