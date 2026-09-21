import { z } from 'zod';

import { MAX_FATHOM_TITLE_SUMMARY_CHARACTERS } from 'src/constants/fathom.constant';

export const fathomGenerateCallRecordingTitlePayloadSchema = z.object({
  callRecordingId: z.uuid(),
  expectedTitle: z.string().min(1),
  originalTitle: z.string().trim().min(1),
  summary: z.string().trim().min(1).max(MAX_FATHOM_TITLE_SUMMARY_CHARACTERS),
});

export type FathomGenerateCallRecordingTitlePayload = z.infer<
  typeof fathomGenerateCallRecordingTitlePayloadSchema
>;
