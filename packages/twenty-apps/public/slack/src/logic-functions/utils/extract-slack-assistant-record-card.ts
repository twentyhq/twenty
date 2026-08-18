import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantRecordCardField } from 'src/logic-functions/types/slack-assistant-record-card-field.type';
import { type SlackAssistantRecordCardPayload } from 'src/logic-functions/types/slack-assistant-record-card-payload.type';

const FENCED_RECORD_CARD_PATTERN =
  /```[a-zA-Z]*[ \t]*\r?\n?[ \t]*(<record-card>[\s\S]*?<\/record-card>)[ \t]*\r?\n?[ \t]*```/gi;
const RECORD_CARD_PATTERN = /<record-card>([\s\S]*?)<\/record-card>/gi;
const UNTERMINATED_RECORD_CARD_PATTERN = /<record-card>[\s\S]*$/i;
const CODE_FENCE_PATTERN = /^```[a-zA-Z]*[ \t]*\r?\n|\r?\n?[ \t]*```$/g;

const isRecordCardField = (
  value: unknown,
): value is SlackAssistantRecordCardField =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as SlackAssistantRecordCardField).label === 'string' &&
  typeof (value as SlackAssistantRecordCardField).value === 'string';

const parseRecordCardPayload = (
  rawPayload: string,
): SlackAssistantRecordCardPayload | undefined => {
  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(rawPayload.trim().replace(CODE_FENCE_PATTERN, ''));
  } catch {
    return undefined;
  }

  if (typeof parsedPayload !== 'object' || parsedPayload === null) {
    return undefined;
  }

  const { recordId, title, subtitle, fields } =
    parsedPayload as Record<string, unknown>;

  if (typeof recordId !== 'string' || !isNonEmptyString(recordId.trim())) {
    return undefined;
  }

  return {
    recordId: recordId.trim(),
    title: typeof title === 'string' ? title : undefined,
    subtitle: typeof subtitle === 'string' ? subtitle : undefined,
    fields: Array.isArray(fields) ? fields.filter(isRecordCardField) : [],
  };
};

// The agent appends a <record-card> trailer when its whole reply is about one
// record. It is a delivery hint, never part of what the member reads, so it is
// always stripped even when it cannot be parsed.
export const extractSlackAssistantRecordCard = (
  responseText: string,
): {
  answerText: string;
  recordCardPayload: SlackAssistantRecordCardPayload | undefined;
} => {
  const unfencedResponseText = responseText.replace(
    FENCED_RECORD_CARD_PATTERN,
    '$1',
  );

  const [firstMatch] = [...unfencedResponseText.matchAll(RECORD_CARD_PATTERN)];

  const answerText = unfencedResponseText
    .replace(RECORD_CARD_PATTERN, '')
    .replace(UNTERMINATED_RECORD_CARD_PATTERN, '')
    .trim();

  return {
    answerText,
    recordCardPayload: isNonEmptyString(firstMatch?.[1])
      ? parseRecordCardPayload(firstMatch[1])
      : undefined,
  };
};
