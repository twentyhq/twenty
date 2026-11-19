import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_SETTINGS_FOLDER_SCHEMA } from 'src/front-components/types/granola-settings-folder.type';

const FOLDERS_RESPONSE_SCHEMA = z.object({
  success: z.literal(true),
  folders: z.array(GRANOLA_SETTINGS_FOLDER_SCHEMA),
  folderIds: z.array(z.string()),
});

export const fetchGranolaPersonalFoldersOrThrow = async (
  connectionId: string,
) =>
  FOLDERS_RESPONSE_SCHEMA.parse(
    await new RestApiClient().get(
      '/s' +
        GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH +
        '?' +
        new URLSearchParams({ connectionId }).toString(),
    ),
  );
