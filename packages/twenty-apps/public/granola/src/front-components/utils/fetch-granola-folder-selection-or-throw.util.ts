import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_FOLDER_SELECTION_ROUTE_PATH } from 'src/constants/granola-folder-selection-route-path';
import { type GranolaStoredFolderSelection } from 'src/front-components/types/granola-stored-folder-selection.type';

const FOLDER_SELECTION_RESULT_SCHEMA = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    folderIds: z.array(z.string()),
    pendingFolderIds: z.array(z.string()).optional(),
  }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const fetchGranolaFolderSelectionOrThrow =
  async (): Promise<GranolaStoredFolderSelection> => {
    const result = FOLDER_SELECTION_RESULT_SCHEMA.parse(
      await new RestApiClient().get(`/s${GRANOLA_FOLDER_SELECTION_ROUTE_PATH}`),
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      selectedFolderIds: result.folderIds,
      pendingFolderIds: result.pendingFolderIds,
    };
  };
