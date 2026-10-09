import { z } from 'zod';

import { callRecordingMediaStateNodeSchema } from 'src/logic-functions/schemas/call-recording-media-state-query-result.schema';

export const callRecordingSyncStateNodeSchema =
  callRecordingMediaStateNodeSchema.extend({
    deletedAt: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    recordingRequestStatus: z.string().nullable().optional(),
    startedAt: z.string().nullable().optional(),
    endedAt: z.string().nullable().optional(),
    transcript: z.unknown().nullable().optional(),
    summary: z
      .object({
        markdown: z.string().nullable().optional(),
        blocknote: z.unknown().nullable().optional(),
      })
      .nullable()
      .optional(),
  });

export const callRecordingSyncStatesQueryResultSchema = z.object({
  callRecordings: z
    .object({
      edges: z.array(
        z
          .object({
            node: callRecordingSyncStateNodeSchema.nullable().optional(),
          })
          .nullable(),
      ),
    })
    .nullable()
    .optional(),
});
