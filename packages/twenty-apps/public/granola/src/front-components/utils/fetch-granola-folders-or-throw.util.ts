import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_FOLDERS_ROUTE_PATH } from 'src/constants/granola-folders-route-path';
import { GRANOLA_SETTINGS_FOLDER_SCHEMA } from 'src/front-components/types/granola-settings-folder.type';

const FOLDERS_RESULT_SCHEMA = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    folders: z.array(GRANOLA_SETTINGS_FOLDER_SCHEMA),
    folderIds: z.array(z.string()),
    pendingFolderIds: z.array(z.string()).optional(),
  }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const fetchGranolaFoldersOrThrow = async () => {
  const result = FOLDERS_RESULT_SCHEMA.parse(
    await new RestApiClient().get(`/s${GRANOLA_FOLDERS_ROUTE_PATH}`),
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return {
    folders: result.folders,
    selectedFolderIds: result.folderIds,
    pendingFolderIds: result.pendingFolderIds,
  };
};
