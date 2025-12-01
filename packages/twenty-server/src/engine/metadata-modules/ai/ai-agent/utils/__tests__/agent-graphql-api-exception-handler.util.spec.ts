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
import { agentGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/ai-agent/utils/agent-graphql-api-exception-handler.util';

describe('agentGraphqlApiExceptionHandler', () => {
  it('should throw NotFoundError for AGENT_NOT_FOUND', () => {
    const exception = new AgentException(
      'Agent not found',
      AgentExceptionCode.AGENT_NOT_FOUND,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(
      NotFoundError,
    );
  });

  it('should throw UserInputError for INVALID_AGENT_INPUT', () => {
    const exception = new AgentException(
      'Invalid agent input',
      AgentExceptionCode.INVALID_AGENT_INPUT,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(
      UserInputError,
    );
  });

  it('should throw ConflictError for AGENT_ALREADY_EXISTS', () => {
    const exception = new AgentException(
      'Agent already exists',
      AgentExceptionCode.AGENT_ALREADY_EXISTS,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(
      ConflictError,
    );
  });

  it('should throw ForbiddenError for AGENT_IS_STANDARD', () => {
    const exception = new AgentException(
      'Agent is standard',
      AgentExceptionCode.AGENT_IS_STANDARD,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(
      ForbiddenError,
    );
  });

  it('should throw ForbiddenError for ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS', () => {
    const exception = new AgentException(
      'Role cannot be assigned to agents',
      AgentExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(
      ForbiddenError,
    );
  });

  it('should rethrow exception for AGENT_EXECUTION_FAILED', () => {
    const exception = new AgentException(
      'Agent execution failed',
      AgentExceptionCode.AGENT_EXECUTION_FAILED,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(exception);
  });

  it('should rethrow exception for API_KEY_NOT_CONFIGURED', () => {
    const exception = new AgentException(
      'API key not configured',
      AgentExceptionCode.API_KEY_NOT_CONFIGURED,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(exception);
  });

  it('should rethrow exception for USER_WORKSPACE_ID_NOT_FOUND', () => {
    const exception = new AgentException(
      'User workspace ID not found',
      AgentExceptionCode.USER_WORKSPACE_ID_NOT_FOUND,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(exception);
  });

  it('should rethrow exception for ROLE_NOT_FOUND', () => {
    const exception = new AgentException(
      'Role not found',
      AgentExceptionCode.ROLE_NOT_FOUND,
    );

    expect(() => agentGraphqlApiExceptionHandler(exception)).toThrow(exception);
  });

  it('should throw the original error if it is not an AgentException', () => {
    const genericError = new Error('Generic error');

    expect(() => agentGraphqlApiExceptionHandler(genericError)).toThrow(
      genericError,
    );
  });
});
