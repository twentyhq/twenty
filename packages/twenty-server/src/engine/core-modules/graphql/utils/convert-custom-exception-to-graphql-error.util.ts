import {
  AuthenticationError,
  BaseGraphQLError,
  ConflictError,
  ErrorCode,
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  TimeoutError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

type GraphQLErrorFactory = (exception: CustomException) => BaseGraphQLError;

const GRAPHQL_ERROR_FACTORY_BY_EXCEPTION_CATEGORY = {
  BAD_USER_INPUT: (exception) => new UserInputError(exception),
  UNAUTHENTICATED: (exception) => new AuthenticationError(exception),
  PAYMENT_REQUIRED: (exception) => new ForbiddenError(exception),
  FORBIDDEN: (exception) => new ForbiddenError(exception),
  NOT_FOUND: (exception) => new NotFoundError(exception),
  METHOD_NOT_ALLOWED: (exception) => new MethodNotAllowedError(exception),
  CONFLICT: (exception) => new ConflictError(exception),
  GONE: (exception) => new NotFoundError(exception),
  PAYLOAD_TOO_LARGE: (exception) => new UserInputError(exception),
  RANGE_NOT_SATISFIABLE: (exception) => new UserInputError(exception),
  UNPROCESSABLE_ENTITY: (exception) => new UserInputError(exception),
  RATE_LIMITED: (exception) =>
    new BaseGraphQLError(exception, ErrorCode.RATE_LIMITED),
  QUOTA_EXHAUSTED: (exception) =>
    new BaseGraphQLError(exception, ErrorCode.QUOTA_EXHAUSTED),
  INTERNAL_SERVER_ERROR: (exception) => new InternalServerError(exception),
  BAD_GATEWAY: (exception) => new InternalServerError(exception),
  SERVICE_UNAVAILABLE: (exception) => new InternalServerError(exception),
  GATEWAY_TIMEOUT: (exception) => new TimeoutError(exception),
} satisfies Record<ExceptionCategory, GraphQLErrorFactory>;

export const convertCustomExceptionToGraphQLError = (
  exception: CustomException,
): BaseGraphQLError =>
  GRAPHQL_ERROR_FACTORY_BY_EXCEPTION_CATEGORY[exception.category](exception);
