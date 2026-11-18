import { z } from 'zod';

import {
  GRANOLA_FOLDER_ID_PATTERN,
  GRANOLA_FOLDER_SELECTION_LIMIT,
} from 'src/constants/granola-api.constant';

export const GRANOLA_PERSONAL_SETTINGS_REQUEST_SCHEMA = z.discriminatedUnion(
  'action',
  [
    z.object({ action: z.literal('list-connections') }),
    z.object({ action: z.literal('list-folders'), connectionId: z.uuid() }),
    z.object({
      action: z.literal('save-folders'),
      connectionId: z.uuid(),
      folderIds: z
        .array(z.string().regex(GRANOLA_FOLDER_ID_PATTERN))
        .max(GRANOLA_FOLDER_SELECTION_LIMIT),
    }),
  ],
);

export type GranolaPersonalSettingsRequest = z.infer<
  typeof GRANOLA_PERSONAL_SETTINGS_REQUEST_SCHEMA
>;
