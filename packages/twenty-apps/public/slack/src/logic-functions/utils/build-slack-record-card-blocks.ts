import { isNonEmptyString } from '@sniptt/guards';
import { type KnownBlock } from '@slack/web-api';

import { SLACK_ASSISTANT_OPEN_RECORD_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-open-record-action-id';
import { type SlackAssistantRecordCard } from 'src/logic-functions/types/slack-assistant-record-card.type';
import { formatSlackRecordObjectLabel } from 'src/logic-functions/utils/format-slack-record-object-label';
import { getSlackRecordObjectEmoji } from 'src/logic-functions/utils/get-slack-record-object-emoji';

export const buildSlackRecordCardBlocks = (
  card: SlackAssistantRecordCard,
): KnownBlock[] => {
  const captionText = [
    formatSlackRecordObjectLabel(card.objectNameSingular),
    card.subtitle,
  ]
    .filter(isNonEmptyString)
    .join(' · ');

  return [
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${getSlackRecordObjectEmoji(card.objectNameSingular)}  *<${card.recordUrl}|${card.title}>*`,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: 'Open in Twenty', emoji: true },
        url: card.recordUrl,
        action_id: SLACK_ASSISTANT_OPEN_RECORD_ACTION_ID,
      },
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: captionText }],
    },
    {
      type: 'section',
      fields: card.fields.map((field) => ({
        type: 'mrkdwn' as const,
        text: `*${field.label}*\n${field.value}`,
      })),
    },
  ];
};
