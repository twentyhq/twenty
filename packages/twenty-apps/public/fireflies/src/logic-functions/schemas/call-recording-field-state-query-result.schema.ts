import { z } from 'zod';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';

export const callRecordingFieldStateQueryResultSchema = z.object({
  callRecordings: z
    .object({
      edges: z.array(
        z
          .object({
            node: z
              .object({
                id: z.string(),
                status: z
                  .enum([
                    CALL_RECORDING_STATUS.PROCESSING,
                    CALL_RECORDING_STATUS.COMPLETED,
                  ])
                  .optional(),
                transcript: z.unknown().nullable().optional(),
                summary: z
                  .object({
                    markdown: z.string().nullable().optional(),
                  })
                  .nullable()
                  .optional(),
              })
              .nullable()
              .optional(),
          })
          .nullable(),
      ),
    })
    .nullable()
    .optional(),
});
