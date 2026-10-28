/* @license Enterprise */

import { msg } from '@lingui/core/macro';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { type RecordShareEntry } from 'src/engine/core-modules/record-share/types/record-share-entry.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveRecordShareEntryOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-entry-or-throw.util';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export const resolveRecordShareEntriesOrThrow = ({
  shareWith,
  flatWorkspaceMemberMaps,
  flatRoleMaps,
}: {
  shareWith: ShareWithInput[];
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  flatRoleMaps: FlatRoleMaps;
}): RecordShareEntry[] => {
  const recordShareEntries = shareWith.map((shareWithEntry) =>
    resolveRecordShareEntryOrThrow({
      shareWithEntry,
      flatWorkspaceMemberMaps,
      flatRoleMaps,
    }),
  );
  const principalIds = recordShareEntries.map(({ principalId }) => principalId);
  const isAnyPrincipalNamedTwice =
    new Set(principalIds).size !== principalIds.length;

  if (isAnyPrincipalNamedTwice) {
    throw new RecordShareException(
      'shareWith names the same principal more than once',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      {
        userFriendlyMessage: msg`shareWith names the same principal more than once`,
      },
    );
  }

  return recordShareEntries;
};
