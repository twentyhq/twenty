import { type KnownBlock } from '@slack/web-api';

import { type SlackAssistantAnswer } from 'src/logic-functions/types/slack-assistant-answer.type';
import { buildSlackRecordContextBlocks } from 'src/logic-functions/utils/build-slack-record-context-blocks';
import { buildSlackRecordTableBlock } from 'src/logic-functions/utils/build-slack-record-table-block';
import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

const buildFooterBlock = (durationMilliseconds: number): KnownBlock => ({
  type: 'context',
  elements: [
    {
      type: 'mrkdwn',
      text: `AI-generated  ·  Answered in ${formatSlackAssistantDuration(durationMilliseconds)}`,
    },
  ],
});

const buildRecordBlocks = ({
  answer,
  workspaceBaseUrl,
}: {
  answer: SlackAssistantAnswer;
  workspaceBaseUrl: string | undefined;
}): KnownBlock[] => {
  if (answer.layout === 'plain') {
    return [];
  }

  if (answer.layout === 'list') {
    const tableBlock = buildSlackRecordTableBlock(answer.records);

    if (tableBlock !== undefined) {
      return [tableBlock];
    }
  }

  return buildSlackRecordContextBlocks({
    records: answer.records,
    workspaceBaseUrl,
  });
};

export const buildSlackAssistantAnswerBlocks = ({
  answer,
  durationMilliseconds,
  workspaceBaseUrl,
}: {
  answer: SlackAssistantAnswer;
  durationMilliseconds: number;
  workspaceBaseUrl: string | undefined;
}): KnownBlock[] => [
  { type: 'markdown', text: answer.answer },
  ...buildRecordBlocks({ answer, workspaceBaseUrl }),
  buildFooterBlock(durationMilliseconds),
];
