import { type KnownBlock } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import {
  SLACK_USER_LINK_CONSENT_ACTION_ID,
  SLACK_USER_LINK_CONSENT_DECISION,
} from 'src/logic-functions/constants/slack-user-link-consent-action-id';
import { type SlackUserLinkConsentButtonValue } from 'src/logic-functions/types/slack-user-link-consent-button-value.type';

const encodeValue = (value: SlackUserLinkConsentButtonValue): string =>
  JSON.stringify(value);

export const buildSlackUserLinkConsentBlocks = ({
  memberName,
  slackTeamId,
  slackUserId,
}: {
  memberName: string | undefined;
  slackTeamId: string;
  slackUserId: string;
}): KnownBlock[] => {
  const memberClause = isNonEmptyString(memberName)
    ? `*${memberName}*`
    : 'a workspace member';

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `An admin wants to let the Twenty assistant answer you using ${memberClause}'s access in this workspace. It will never do more than your own permissions or the assistant role allow. Approve to turn this on, or decline to keep it off.`,
      },
    },
    {
      type: 'actions',
      block_id: SLACK_USER_LINK_CONSENT_ACTION_ID,
      elements: [
        {
          type: 'button',
          action_id: `${SLACK_USER_LINK_CONSENT_ACTION_ID}:approve`,
          style: 'primary',
          text: { type: 'plain_text', text: 'Approve' },
          value: encodeValue({
            decision: SLACK_USER_LINK_CONSENT_DECISION.APPROVE,
            slackTeamId,
            slackUserId,
          }),
        },
        {
          type: 'button',
          action_id: `${SLACK_USER_LINK_CONSENT_ACTION_ID}:decline`,
          style: 'danger',
          text: { type: 'plain_text', text: 'Decline' },
          value: encodeValue({
            decision: SLACK_USER_LINK_CONSENT_DECISION.DECLINE,
            slackTeamId,
            slackUserId,
          }),
        },
      ],
    },
  ];
};
