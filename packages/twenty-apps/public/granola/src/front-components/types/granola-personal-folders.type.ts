import { z } from 'zod';

import { GRANOLA_SETTINGS_FOLDER_SCHEMA } from 'src/front-components/types/granola-settings-folder.type';

export const GRANOLA_PERSONAL_FOLDERS_SCHEMA = z.object({
  folders: z.array(GRANOLA_SETTINGS_FOLDER_SCHEMA),
  folderIds: z.array(z.string()),
});

export type GranolaPersonalFolders = z.infer<
  typeof GRANOLA_PERSONAL_FOLDERS_SCHEMA
>;
