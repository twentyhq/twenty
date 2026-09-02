import { type RoutePayload } from 'twenty-sdk/define';

import { type SlackSetUserLinkInput } from 'src/logic-functions/types/slack-set-user-link-input.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export type SlackSetUserLinkPayload =
  | SlackSetUserLinkInput
  | RoutePayload<SlackSetUserLinkInput>;

const isRoutePayload = (
  payload: SlackSetUserLinkPayload,
): payload is RoutePayload<SlackSetUserLinkInput> => 'body' in payload;

const toSlackSetUserLinkInput = (source: unknown): SlackSetUserLinkInput => {
  const body = asRecord(source) ?? {};

  return {
    workspaceMemberId: readOptionalString(body.workspaceMemberId) ?? '',
    slackUserId: readOptionalString(body.slackUserId),
    email: readOptionalString(body.email),
    slackTeamId: readOptionalString(body.slackTeamId),
    name: readOptionalString(body.name),
  };
};

export const extractSlackSetUserLinkInput = (
  payload: SlackSetUserLinkPayload,
): SlackSetUserLinkInput =>
  toSlackSetUserLinkInput(isRoutePayload(payload) ? payload.body : payload);
