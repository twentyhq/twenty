import { z } from 'zod';

import { callRecordingMediaStateNodeSchema } from 'src/logic-functions/schemas/call-recording-media-state-query-result.schema';

export const fathomMediaReconciliationQueryResultSchema = z.object({
  callRecordings: z
    .object({
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        endCursor: z.string().nullable().optional(),
      }),
      edges: z.array(
        z.object({
          node: callRecordingMediaStateNodeSchema.extend({
            status: z.string(),
            updatedAt: z.string(),
          }),
        }),
      ),
    })
    .nullable()
    .optional(),
});
