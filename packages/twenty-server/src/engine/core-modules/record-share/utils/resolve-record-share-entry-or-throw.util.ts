/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShareEntry } from 'src/engine/core-modules/record-share/types/record-share-entry.type';
import { type RecordSharePrincipalMaps } from 'src/engine/core-modules/record-share/types/record-share-principal-maps.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-principal-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';

export const resolveRecordShareEntryOrThrow = ({
  shareWithEntry,
  flatWorkspaceMemberMaps,
  flatRoleMaps,
}: RecordSharePrincipalMaps & {
  shareWithEntry: ShareWithInput;
}): RecordShareEntry => {
  const isNamedPrincipalGrantRemoval =
    shareWithEntry.accessLevel === RecordShareAccessLevel.NONE &&
    !shareWithEntry.everyone;

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
