import { isNonEmptyString } from '@sniptt/guards';

import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { type SlackInteractivityRequestBody } from 'src/logic-functions/types/slack-interactivity-request-body.type';
import { isSlackInteractivityPayload } from 'src/logic-functions/utils/is-slack-interactivity-payload';

export const parseSlackInteractivityPayload = (
  body: SlackInteractivityRequestBody | null | undefined,
): SlackInteractivityPayload => {
  if (!isNonEmptyString(body?.payload)) {
    throw new Error('Slack interactivity request has no payload field');
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(body.payload);
  } catch {
    throw new Error('Slack interactivity payload is not valid JSON');
  }

  if (!isSlackInteractivityPayload(parsedPayload)) {
    throw new Error('Slack interactivity payload has an unexpected shape');
  }

  return parsedPayload;
};
