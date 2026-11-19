import { isDefined } from 'twenty-sdk/utils';

import { assertGranolaFolderSelectionReadyOrThrow } from 'src/logic-functions/utils/assert-granola-folder-selection-ready-or-throw.util';
import { enqueueGranolaNoteDiscoveryOrThrow } from 'src/logic-functions/utils/enqueue-granola-note-discovery-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';

export const enqueueGranolaBackfillOrThrow = async ({
  createdAfter,
  updatedAfter,
  folderIds,
}: {
  createdAfter?: string;
  updatedAfter?: string;
  folderIds?: string[];
}) => {
  await assertGranolaFolderSelectionReadyOrThrow();
  const registration = await findGranolaRegistrationForCurrentKey();

  if (!isDefined(registration)) {
    throw new Error('Set up live sync before importing notes.');
  }

  const selectedFolders = folderIds ?? registration.folderIds;

  return enqueueGranolaNoteDiscoveryOrThrow({
    registrationId: registration.registrationId,
    createdAfter,
    updatedAfter,
    discoveryFolderIds:
      selectedFolders.length > 0 ? selectedFolders : [undefined],
  });
};
