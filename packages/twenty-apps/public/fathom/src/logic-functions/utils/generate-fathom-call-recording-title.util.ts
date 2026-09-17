import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { runAgent } from 'twenty-sdk/logic-function';
import { z } from 'zod';

import { MAX_FATHOM_MEETING_TOPIC_CHARACTERS } from 'src/constants/fathom.constant';
import { FATHOM_MEETING_TOPIC_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getFathomMeetingTitle } from 'src/logic-functions/utils/get-fathom-meeting-title.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const IMPROMPTU_MEETING_TITLE_PATTERN =
  /^impromptu(?:\s+(?:zoom|google meet|microsoft teams|slack huddle))?(?:\s+(?:meeting|call))?$/i;
const TITLE_GENERATION_TIMEOUT_MILLISECONDS = 10_000;
const MAX_SUMMARY_CHARACTERS = 12_000;

const meetingTopicResultSchema = z.object({
  response: z
    .string()
    .trim()
    .min(1)
    .max(MAX_FATHOM_MEETING_TOPIC_CHARACTERS)
    .refine((topic) => topic !== 'NO_TOPIC' && !/[\r\n()[\]]/.test(topic)),
});

export const generateFathomCallRecordingTitle = async (
  meeting: Pick<
    Meeting,
    | 'meetingTitle'
    | 'title'
    | 'recordingId'
    | 'recordingStartTime'
    | 'defaultSummary'
  >,
): Promise<string> => {
  const title = getFathomMeetingTitle(meeting);

  if (!IMPROMPTU_MEETING_TITLE_PATTERN.test(title)) {
    return title;
  }

  const recordingTitle = meeting.title.trim();

  if (
    isNonEmptyString(recordingTitle) &&
    !IMPROMPTU_MEETING_TITLE_PATTERN.test(recordingTitle)
  ) {
    return recordingTitle;
  }

  const recordingDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(meeting.recordingStartTime);
  const fallbackTitle = `${title} (${recordingDate} UTC)`;
  const summary = meeting.defaultSummary?.markdownFormatted?.trim();

  if (!isNonEmptyString(summary)) {
    return fallbackTitle;
  }

  let titleGenerationTimeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const agentResult = await Promise.race([
      runAgent({
        agentUniversalIdentifier:
          FATHOM_MEETING_TOPIC_AGENT_UNIVERSAL_IDENTIFIER,
        prompt: summary.slice(0, MAX_SUMMARY_CHARACTERS),
      }),
      new Promise<undefined>((resolve) => {
        titleGenerationTimeout = setTimeout(
          () => resolve(undefined),
          TITLE_GENERATION_TIMEOUT_MILLISECONDS,
        );
      }),
    ]);

    if (!agentResult?.success) {
      return fallbackTitle;
    }

    const topicResult = meetingTopicResultSchema.safeParse(agentResult.result);

    return topicResult.success
      ? `${title} (${topicResult.data.response})`
      : fallbackTitle;
  } catch (error) {
    console.warn(
      `Could not generate a topic for Fathom recording ${meeting.recordingId}`,
      toErrorMessage(error),
    );

    return fallbackTitle;
  } finally {
    clearTimeout(titleGenerationTimeout);
  }
};
