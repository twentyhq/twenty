import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_FOLDER_SELECTION_ROUTE_PATH } from 'src/constants/granola-folder-selection-route-path';

const SAVE_RESULT_SCHEMA = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true), folderIds: z.array(z.string()) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const saveGranolaFolderSelectionOrThrow = async (
  folderIds: string[],
): Promise<string[]> => {
  const result = SAVE_RESULT_SCHEMA.parse(
    await new RestApiClient().post(`/s${GRANOLA_FOLDER_SELECTION_ROUTE_PATH}`, {
      folderIds,
    }),
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.folderIds;
};
