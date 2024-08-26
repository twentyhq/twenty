import { CustomException } from 'src/utils/custom-exception';

export class GraphqlQueryRunnerException extends CustomException {
  code: GraphqlQueryRunnerExceptionCode;
  constructor(message: string, code: GraphqlQueryRunnerExceptionCode) {
    super(message, code);
  }
}

export enum GraphqlQueryRunnerExceptionCode {
  ERR_GRAPHQL_QUERY_RUNNER_MAX_DEPTH_REACHED = 'ERR_GRAPHQL_QUERY_RUNNER_MAX_DEPTH_REACHED',
  ERR_GRAPHQL_QUERY_RUNNER_INVALID_CURSOR = 'ERR_GRAPHQL_QUERY_RUNNER_INVALID_CURSOR',
  ERR_GRAPHQL_QUERY_RUNNER_INVALID_DIRECTION = 'ERR_GRAPHQL_QUERY_RUNNER_INVALID_DIRECTION',
  ERR_GRAPHQL_QUERY_RUNNER_UNSUPPORTED_OPERATOR = 'ERR_GRAPHQL_QUERY_RUNNER_UNSUPPORTED_OPERATOR',
  ERR_GRAPHQL_QUERY_RUNNER_ARGS_CONFLICT = 'ERR_GRAPHQL_QUERY_RUNNER_ARGS_CONFLICT',
}
