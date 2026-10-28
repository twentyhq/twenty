/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type RecordShareEntry } from 'src/engine/core-modules/record-share/types/record-share-entry.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-principal-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export const resolveRecordShareEntryOrThrow = ({
  shareWithEntry,
  flatWorkspaceMemberMaps,
  flatRoleMaps,
}: {
  shareWithEntry: ShareWithInput;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  flatRoleMaps: FlatRoleMaps;
}): RecordShareEntry => {
  const isNamedPrincipalGrantRemoval =
    shareWithEntry.accessLevel === RecordShareAccessLevel.NONE &&
    shareWithEntry.everyone !== true;

  if (isNamedPrincipalGrantRemoval) {
    return {
      ...resolveRecordSharePrincipalOrThrow(shareWithEntry),
      accessLevel: RecordShareAccessLevel.NONE,
    };
  }

  const [recordShareEntry] = validateShareWithPrincipalsOrThrow({
    shareWith: [shareWithEntry],
    flatWorkspaceMemberMaps,
    flatRoleMaps,
  });

  return recordShareEntry;
};
