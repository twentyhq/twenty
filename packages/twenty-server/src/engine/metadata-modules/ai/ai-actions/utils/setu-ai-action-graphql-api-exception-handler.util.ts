import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';

export const setuAiActionGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof SetuAiActionException) {
    switch (error.code) {
      case 'NOT_AVAILABLE':
        throw new NotFoundError(error);
      case 'INVALID_INPUT':
      case 'UNSUPPORTED_ACTION':
        throw new UserInputError(error);
      case 'STALE_VERSION':
      case 'NOT_REVIEWABLE':
      case 'ACTION_ALREADY_STARTED':
      case 'APPROVAL_EXPIRED':
      case 'SOURCE_CHANGED':
      case 'TIMED_OUT':
      case 'RESEARCH_FAILED':
        throw new ConflictError(error);
      case 'ACCOUNT_UNAVAILABLE':
      case 'BUDGET_EXHAUSTED':
      case 'MODEL_UNAVAILABLE':
        throw new ForbiddenError(error);
      default:
        return assertUnreachable(error.code);
    }
  }

  throw error;
};
