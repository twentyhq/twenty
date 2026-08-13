import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export type SlackInstallRevokedPayload = SlackEventsRequestBody & {
  claimedWorkspaceId?: string;
};
