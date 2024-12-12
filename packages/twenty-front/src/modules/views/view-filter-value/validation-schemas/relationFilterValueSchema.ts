import { z } from 'zod';

export const relationFilterValueSchema = z.preprocess(
  (value) => JSON.parse(z.string().parse(value)),
  z.object({
    isCurrentWorkspaceMemberSelected: z.boolean(),
    selectedRecordIds: z.array(z.string()),
  }),
);
