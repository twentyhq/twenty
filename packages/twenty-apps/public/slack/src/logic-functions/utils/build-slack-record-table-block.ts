import { type RawTextElement, type TableBlock } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import { type SlackAnswerRecord } from 'src/logic-functions/types/slack-assistant-answer.type';

const NAME_COLUMN_HEADER = 'Name';

// Slack caps a table at 20 columns; a Slack message is far narrower than that
const TABLE_COLUMN_MAX_COUNT = 4;

const cell = (text: string): RawTextElement => ({ type: 'raw_text', text });

const getSharedFieldLabels = (records: SlackAnswerRecord[]): string[] =>
  (records[0]?.fields ?? [])
    .map((field) => field.label)
    .filter((label) =>
      records.every((record) =>
        record.fields.some((field) => field.label === label),
      ),
    )
    .slice(0, TABLE_COLUMN_MAX_COUNT - 1);

const getFieldValue = (record: SlackAnswerRecord, label: string): string =>
  record.fields.find((field) => field.label === label)?.value ?? '';

// a table only works when every row has the same columns, so it is built from
// the field labels all records share; without any, the caller falls back to
// one context line per record
export const buildSlackRecordTableBlock = (
  records: SlackAnswerRecord[],
): TableBlock | undefined => {
  const labels = getSharedFieldLabels(records);

  if (!isNonEmptyArray(records) || !isNonEmptyArray(labels)) {
    return undefined;
  }

  return {
    type: 'table',
    rows: [
      [cell(NAME_COLUMN_HEADER), ...labels.map(cell)],
      ...records.map((record) => [
        cell(record.name),
        ...labels.map((label) => cell(getFieldValue(record, label))),
      ]),
    ],
  };
};
