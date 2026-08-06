import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const getSlackBotUserIdFromEventBody = (
  body: Pick<SlackEventsRequestBody, 'authorizations'>,
): string | undefined =>
  body.authorizations?.find(
    (authorization) =>
      authorization.is_bot && isNonEmptyString(authorization.user_id),
  )?.user_id;
