import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-response-fallback-text';
import { SLACK_ANSWER_RECORD_MAX_COUNT } from 'src/logic-functions/constants/slack-answer-record-max-count';
import {
  SLACK_ANSWER_LAYOUTS,
  type SlackAnswerField,
  type SlackAnswerLayout,
  type SlackAnswerRecord,
  type SlackAssistantAnswer,
} from 'src/logic-functions/types/slack-assistant-answer.type';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBJECT_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/;

const readString = (source: object, key: string): string | undefined => {
  if (!(key in source)) {
    return undefined;
  }

  const value = (source as Record<string, unknown>)[key];

  return typeof value === 'string' ? value : undefined;
};

const parseLayout = (value: string | undefined): SlackAnswerLayout =>
  SLACK_ANSWER_LAYOUTS.find((layout) => layout === value) ?? 'plain';

const parseField = (value: unknown): SlackAnswerField | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const label = readString(value, 'label');
  const fieldValue = readString(value, 'value');

  return isNonEmptyString(label) && isNonEmptyString(fieldValue)
    ? { label: label.trim(), value: fieldValue.trim() }
    : undefined;
};

const isField = (field: SlackAnswerField | undefined): field is SlackAnswerField =>
  field !== undefined;

const parseRecord = (value: unknown): SlackAnswerRecord | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const objectNameSingular = readString(value, 'objectNameSingular');
  const recordId = readString(value, 'recordId');
  const name = readString(value, 'name');

  // an id the agent invented cannot be linked, and a record without a name has
  // nothing to show, so both drop out rather than rendering a broken row
  if (
    !isNonEmptyString(objectNameSingular) ||
    !OBJECT_NAME_PATTERN.test(objectNameSingular) ||
    !isNonEmptyString(recordId) ||
    !UUID_PATTERN.test(recordId) ||
    !isNonEmptyString(name)
  ) {
    return undefined;
  }

  const rawFields = (value as { fields?: unknown }).fields;

  return {
    objectNameSingular,
    recordId,
    name: name.trim(),
    fields: Array.isArray(rawFields)
      ? rawFields.map(parseField).filter(isField)
      : [],
  };
};

const isRecord = (
  record: SlackAnswerRecord | undefined,
): record is SlackAnswerRecord => record !== undefined;

const parseRecords = (rawRecords: string | undefined): SlackAnswerRecord[] => {
  if (!isNonEmptyString(rawRecords)) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawRecords);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(parseRecord)
      .filter(isRecord)
      .slice(0, SLACK_ANSWER_RECORD_MAX_COUNT);
  } catch {
    return [];
  }
};

// never throws: any malformed part degrades to a plain prose answer rather
// than losing a reply the agent already produced
export const parseSlackAssistantAnswer = (
  agentResult: RunAgentResult,
): SlackAssistantAnswer | undefined => {
  if (!agentResult.success || agentResult.result === null) {
    return undefined;
  }

  const answer = readString(agentResult.result, 'answer')?.trim();
  const records = parseRecords(readString(agentResult.result, 'records'));
  const layout = parseLayout(readString(agentResult.result, 'layout'));

  return {
    answer: isNonEmptyString(answer)
      ? answer
      : SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT,
    layout: records.length === 0 ? 'plain' : layout,
    records,
  };
};
