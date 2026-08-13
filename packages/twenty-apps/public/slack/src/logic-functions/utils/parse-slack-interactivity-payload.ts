import { isNonEmptyString } from '@sniptt/guards';

import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { type SlackInteractivityRequestBody } from 'src/logic-functions/types/slack-interactivity-request-body.type';

export const parseSlackInteractivityPayload = (
  body: SlackInteractivityRequestBody | null | undefined,
): SlackInteractivityPayload => {
  if (!isNonEmptyString(body?.payload)) {
    throw new Error('Slack interactivity request has no payload field');
  }

  try {
    return JSON.parse(body.payload) as SlackInteractivityPayload;
  } catch {
    throw new Error('Slack interactivity payload is not valid JSON');
  }
};
