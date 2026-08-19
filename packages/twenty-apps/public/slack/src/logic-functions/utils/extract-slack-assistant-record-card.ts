import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantRecordCardField } from 'src/logic-functions/types/slack-assistant-record-card-field.type';
import { type SlackAssistantRecordCardPayload } from 'src/logic-functions/types/slack-assistant-record-card-payload.type';

const FENCED_RECORD_CARD_TAG_PATTERN =
  /```[a-zA-Z-]*[ \t]*\r?\n?[ \t]*(<record-card>[\s\S]*?<\/record-card>)[ \t]*\r?\n?[ \t]*```/gi;

// The agent is asked for a <record-card> tag, but a model that drops the tag
// still tends to leave the JSON behind, so the fenced and bare shapes are read
// too. Whichever shape matched is stripped: a delivery hint never reaches a
// member, parsed or not.
const RECORD_CARD_PATTERNS = [
  /<record-card>([\s\S]*?)<\/record-card>/gi,
  /```record-card[ \t]*\r?\n([\s\S]*?)\r?\n?[ \t]*```/gi,
  /(\{[^{}]*"recordId"[\s\S]*\})[ \t\r\n]*$/gi,
];

const UNTERMINATED_RECORD_CARD_PATTERN = /<record-card>[\s\S]*$/i;
const CODE_FENCE_PATTERN = /^```[a-zA-Z-]*[ \t]*\r?\n|\r?\n?[ \t]*```$/g;

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
    parsedPayload = JSON.parse(
      rawPayload.trim().replace(CODE_FENCE_PATTERN, ''),
    );
  } catch {
    return undefined;
  }

  if (typeof parsedPayload !== 'object' || parsedPayload === null) {
    return undefined;
  }

  const { recordId, title, subtitle, fields } = parsedPayload as Record<
    string,
    unknown
  >;

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

export const extractSlackAssistantRecordCard = (
  responseText: string,
): {
  answerText: string;
  recordCardPayload: SlackAssistantRecordCardPayload | undefined;
} => {
  let answerText = responseText.replace(FENCED_RECORD_CARD_TAG_PATTERN, '$1');
  let recordCardPayload: SlackAssistantRecordCardPayload | undefined;

  for (const recordCardPattern of RECORD_CARD_PATTERNS) {
    const [firstMatch] = [...answerText.matchAll(recordCardPattern)];

    if (firstMatch === undefined) {
      continue;
    }

    answerText = answerText.replace(recordCardPattern, '');
    recordCardPayload = parseRecordCardPayload(firstMatch[1]);

    break;
  }

  return {
    answerText: answerText.replace(UNTERMINATED_RECORD_CARD_PATTERN, '').trim(),
    recordCardPayload,
  };
};
