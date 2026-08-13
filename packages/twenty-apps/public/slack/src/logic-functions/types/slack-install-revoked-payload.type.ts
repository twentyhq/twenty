import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

// claimedWorkspaceId is the claim holder the resolver routed this event to,
// captured so the handler can tell whether the claim still belongs to it by
// the time it runs.
export type SlackInstallRevokedPayload = SlackEventsRequestBody & {
  claimedWorkspaceId?: string;
};
