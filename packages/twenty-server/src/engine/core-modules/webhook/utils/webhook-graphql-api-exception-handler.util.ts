import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/core-modules/webhook/webhook.exception';

export const webhookGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WebhookException) {
    switch (error.code) {
      case WebhookExceptionCode.WEBHOOK_NOT_FOUND:
        throw new NotFoundError(error.message);
      case WebhookExceptionCode.INVALID_TARGET_URL:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
