import { type CalloutProps } from 'twenty-ui/feedback';

import {
  SLACK_CONNECTION_HEALTH,
  type SlackConnectionHealth,
} from 'src/logic-functions/constants/slack-connection-health';

export const SLACK_CONNECTION_HEALTH_CALLOUTS: Partial<
  Record<SlackConnectionHealth, Pick<CalloutProps, 'title' | 'description'>>
> = {
  [SLACK_CONNECTION_HEALTH.TOKEN_REJECTED]: {
    title: 'Slack connection is no longer valid',
    description:
      'Slack rejected the stored credentials, so the assistant cannot read or send messages. Remove the Slack connection and add it again.',
  },
  [SLACK_CONNECTION_HEALTH.TEAM_CLAIMED_BY_ANOTHER_WORKSPACE]: {
    title: 'Slack workspace already connected elsewhere',
    description:
      'This Slack workspace is registered to another Twenty workspace, so its messages are delivered there. Disconnect Slack in that workspace first, then remove the connection here and add it again.',
  },
  [SLACK_CONNECTION_HEALTH.TEAM_UNCLAIMED]: {
    title: 'Slack connection needs to be registered again',
    description:
      'No Twenty workspace is registered for this Slack workspace, so its messages are not delivered anywhere. Remove the Slack connection and add it again.',
  },
};
