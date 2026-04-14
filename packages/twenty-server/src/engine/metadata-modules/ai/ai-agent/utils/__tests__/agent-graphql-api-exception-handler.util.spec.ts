import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { agentGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/ai-agent/utils/agent-graphql-api-exception-handler.util';
import {
  ErrorCode,
  type BaseGraphQLError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const catchGraphqlError = (error: Error): BaseGraphQLError => {
  try {
    agentGraphqlApiExceptionHandler(error);
    throw new Error('Expected agentGraphqlApiExceptionHandler to throw');
  } catch (graphqlError) {
    return graphqlError as BaseGraphQLError;
  }
};

describe('agentGraphqlApiExceptionHandler', () => {
  it('maps API key configuration failures to INTERNAL_SERVER_ERROR with a subCode', () => {
    const error = new AgentException(
      'No AI models are available',
      AgentExceptionCode.API_KEY_NOT_CONFIGURED,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(graphqlError.extensions.subCode).toBe(
      AgentExceptionCode.API_KEY_NOT_CONFIGURED,
    );
    expect(graphqlError.extensions.userFriendlyMessage).toBeDefined();
  });
});
