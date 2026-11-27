import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_PERSONAL_FOLDER_SELECTION_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';

const FOLDER_SELECTION_RESPONSE_SCHEMA = z.object({
  success: z.literal(true),
  folderIds: z.array(z.string()),
});

export const saveGranolaPersonalFolderSelectionOrThrow = async ({
  connectionId,
  folderIds,
}: {
  connectionId: string;
  folderIds: string[];
}) => {
  const result = FOLDER_SELECTION_RESPONSE_SCHEMA.parse(
    await new RestApiClient().post(
      '/s' + GRANOLA_PERSONAL_FOLDER_SELECTION_ROUTE_PATH,
      { connectionId, folderIds },
    ),
  );

  return result.folderIds;
};
