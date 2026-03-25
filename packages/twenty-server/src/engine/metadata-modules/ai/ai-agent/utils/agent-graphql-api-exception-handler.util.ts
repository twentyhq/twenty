import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';

export const agentGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof AgentException) {
    switch (error.code) {
      case AgentExceptionCode.AGENT_NOT_FOUND:
      case AgentExceptionCode.ROLE_NOT_FOUND:
        throw new NotFoundError(error);
      case AgentExceptionCode.INVALID_AGENT_INPUT:
        throw new UserInputError(error);
      case AgentExceptionCode.AGENT_ALREADY_EXISTS:
        throw new ConflictError(error);
      case AgentExceptionCode.AGENT_IS_STANDARD:
      case AgentExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
        throw new ForbiddenError(error);
      case AgentExceptionCode.AGENT_EXECUTION_FAILED:
      case AgentExceptionCode.API_KEY_NOT_CONFIGURED:
      case AgentExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
        throw error;
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
