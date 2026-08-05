import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const getSlackBotUserIdFromEventBody = (
  body: SlackEventsRequestBody,
): string | undefined =>
  body.authorizations?.find(
    (authorization) =>
      authorization.is_bot !== false && isNonEmptyString(authorization.user_id),
  )?.user_id;
