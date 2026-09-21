import { runAgent } from 'twenty-sdk/logic-function';
import { z } from 'zod';

import { MAX_FATHOM_MEETING_TOPIC_CHARACTERS } from 'src/constants/fathom.constant';
import { FATHOM_MEETING_TOPIC_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomGenerateCallRecordingTitlePayload } from 'src/logic-functions/schemas/fathom-generate-call-recording-title-payload.schema';

const meetingTopicResultSchema = z.object({
  response: z
    .string()
    .trim()
    .min(1)
    .max(MAX_FATHOM_MEETING_TOPIC_CHARACTERS)
    .refine((topic) => topic !== 'NO_TOPIC' && !/[\r\n()[\]]/.test(topic)),
});

export const generateFathomCallRecordingTitle = async ({
  originalTitle,
  summary,
}: Pick<
  FathomGenerateCallRecordingTitlePayload,
  'originalTitle' | 'summary'
>): Promise<string | undefined> => {
  const agentResult = await runAgent({
    agentUniversalIdentifier: FATHOM_MEETING_TOPIC_AGENT_UNIVERSAL_IDENTIFIER,
    prompt: summary,
  });

  if (!agentResult.success) {
    return undefined;
  }

  const topicResult = meetingTopicResultSchema.safeParse(agentResult.result);

  return topicResult.success
    ? `${originalTitle} (${topicResult.data.response})`
    : undefined;
};
