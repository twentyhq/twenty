import { type ContextBlock } from '@slack/web-api';

import {
  SLACK_ANSWER_RECORD_DEFAULT_EMOJI,
  SLACK_ANSWER_RECORD_EMOJIS,
} from 'src/logic-functions/constants/slack-answer-record-emojis';
import { type SlackAnswerRecord } from 'src/logic-functions/types/slack-assistant-answer.type';
import { escapeSlackMrkdwn } from 'src/logic-functions/utils/escape-slack-mrkdwn';
import { formatSlackAnswerValue } from 'src/logic-functions/utils/format-slack-answer-value';
import { getSlackAnswerRecordUrl } from 'src/logic-functions/utils/get-slack-answer-record-url';

const SEPARATOR = '   ·   ';

const buildRecordLine = ({
  record,
  workspaceBaseUrl,
}: {
  record: SlackAnswerRecord;
  workspaceBaseUrl: string | undefined;
}): string => {
  const emoji =
    SLACK_ANSWER_RECORD_EMOJIS[record.objectNameSingular.toLowerCase()] ??
    SLACK_ANSWER_RECORD_DEFAULT_EMOJI;

  const recordUrl = getSlackAnswerRecordUrl({ record, workspaceBaseUrl });
  const escapedName = escapeSlackMrkdwn(record.name);

  const name =
    recordUrl === undefined
      ? `*${escapedName}*`
      : `*<${recordUrl}|${escapedName}>*`;

  const fields = record.fields.map(
    (field) =>
      `${escapeSlackMrkdwn(field.label)} ${formatSlackAnswerValue(escapeSlackMrkdwn(field.value))}`,
  );

  return [`${emoji} ${name}`, ...fields].join(SEPARATOR);
};

// one small grey line per record: the lightest chrome Slack offers, so the
// record detail stays subordinate to the answer instead of framing it
export const buildSlackRecordContextBlocks = ({
  records,
  workspaceBaseUrl,
}: {
  records: SlackAnswerRecord[];
  workspaceBaseUrl: string | undefined;
}): ContextBlock[] =>
  records.map((record) => ({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: buildRecordLine({ record, workspaceBaseUrl }),
      },
    ],
  }));
