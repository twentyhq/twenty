import { type MessageDescriptor } from '@lingui/core';
import {
  type ASTNode,
  GraphQLError,
  type GraphQLFormattedError,
  type Source,
  type SourceLocation,
} from 'graphql';

import { CustomException } from 'src/utils/custom-exception';

declare module 'graphql' {
  export interface GraphQLErrorExtensions {
    exception?: {
      code?: string;
      stackTrace?: ReadonlyArray<string>;
    };
  }
}

export enum ErrorCode {
  GRAPHQL_PARSE_FAILED = 'GRAPHQL_PARSE_FAILED',
  GRAPHQL_VALIDATION_FAILED = 'GRAPHQL_VALIDATION_FAILED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND',
  PERSISTED_QUERY_NOT_SUPPORTED = 'PERSISTED_QUERY_NOT_SUPPORTED',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  METADATA_VALIDATION_FAILED = 'METADATA_VALIDATION_FAILED',
}

type RestrictedGraphQLErrorExtensions = {
  userFriendlyMessage?: MessageDescriptor;
  subCode?: string;
};

export class BaseGraphQLError extends GraphQLError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public extensions: Record<string, any>;
  override readonly name!: string;
  readonly locations: ReadonlyArray<SourceLocation> | undefined;
  readonly path: ReadonlyArray<string | number> | undefined;
  readonly source: Source | undefined;
  readonly positions: ReadonlyArray<number> | undefined;
  readonly nodes: ReadonlyArray<ASTNode> | undefined;
  public originalError: Error | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  constructor(
    exceptionOrMessage: string | CustomException,
    code?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: Record<string, any>,
  ) {
    if (exceptionOrMessage instanceof CustomException) {
      const exception = exceptionOrMessage;

      super(exception.message);

      this.extensions = {
        subCode: exception.code,
        userFriendlyMessage: exception.userFriendlyMessage,
        code,
      };
    } else {
      const message = exceptionOrMessage;

      super(message);

      if (extensions?.extensions) {
        throw new Error(
          'Pass extensions directly as the third argument of the ApolloError constructor: `new ' +
            'ApolloError(message, code, {myExt: value})`, not `new ApolloError(message, code, ' +
            '{extensions: {myExt: value}})`',
        );
      }

      this.extensions = { ...extensions, code };
    }

    // if no name provided, use the default. defineProperty ensures that it stays non-enumerable
    if (!this.name) {
      Object.defineProperty(this, 'name', { value: 'GraphQLError' });
    }
  }

  toJSON(): GraphQLFormattedError {
    return toGraphQLError(this).toJSON();
  }

  override toString(): string {
    return toGraphQLError(this).toString();
  }

  get [Symbol.toStringTag](): string {
    return this.name;
  }
}

function toGraphQLError(error: BaseGraphQLError): GraphQLError {
  return new GraphQLError(error.message, {
    nodes: error.nodes,
    source: error.source,
    positions: error.positions,
    path: error.path,
    originalError: error.originalError,
    extensions: error.extensions,
  });
}

export class SyntaxError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.GRAPHQL_PARSE_FAILED);

    Object.defineProperty(this, 'name', { value: 'SyntaxError' });
  }
}

export class ValidationError extends BaseGraphQLError {
  constructor(message: string, extensions?: BaseGraphQLError['extensions']) {
    super(message, ErrorCode.GRAPHQL_VALIDATION_FAILED, extensions);

    Object.defineProperty(this, 'name', { value: 'ValidationError' });
  }
}

export class NotFoundError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.NOT_FOUND, extensions);
    Object.defineProperty(this, 'name', { value: 'NotFoundError' });
  }
}

export class AuthenticationError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.UNAUTHENTICATED, extensions);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}

export class ForbiddenError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.FORBIDDEN, extensions);
    Object.defineProperty(this, 'name', { value: 'ForbiddenError' });
  }
}

export class UserInputError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(
    message: string,
    extensions?: RestrictedGraphQLErrorExtensions & { isExpected?: boolean },
  );

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions & { isExpected?: boolean },
  ) {
    super(messageOrException, ErrorCode.BAD_USER_INPUT, extensions);
    Object.defineProperty(this, 'name', { value: 'UserInputError' });
  }
}

export class MethodNotAllowedError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.METHOD_NOT_ALLOWED, extensions);
    Object.defineProperty(this, 'name', { value: 'MethodNotAllowedError' });
  }
}

export class ConflictError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.CONFLICT, extensions);
    Object.defineProperty(this, 'name', { value: 'ConflictError' });
  }
}

export class TimeoutError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.TIMEOUT, extensions);
    Object.defineProperty(this, 'name', { value: 'TimeoutError' });
  }
}

export class InternalServerError extends BaseGraphQLError {
  constructor(exception: CustomException);

  constructor(message: string, extensions?: RestrictedGraphQLErrorExtensions);

  constructor(
    messageOrException: string | CustomException,
    extensions?: RestrictedGraphQLErrorExtensions,
  ) {
    super(messageOrException, ErrorCode.INTERNAL_SERVER_ERROR, extensions);
    Object.defineProperty(this, 'name', { value: 'InternalServerError' });
  }
}

/**
 * Converts a GraphQLError to a BaseGraphQLError with the appropriate ErrorCode
 * based on HTTP status code if present in extensions.
 */
export const convertGraphQLErrorToBaseGraphQLError = (
  error: GraphQLError,
): BaseGraphQLError => {
  const httpStatus = error.extensions?.http?.status;
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;

  if (httpStatus && typeof httpStatus === 'number') {
    switch (httpStatus) {
      case 400:
        errorCode = ErrorCode.BAD_USER_INPUT;
        break;
      case 401:
        errorCode = ErrorCode.UNAUTHENTICATED;
        break;
      case 403:
        errorCode = ErrorCode.FORBIDDEN;
        break;
      case 404:
        errorCode = ErrorCode.NOT_FOUND;
        break;
      case 405:
        errorCode = ErrorCode.METHOD_NOT_ALLOWED;
        break;
      case 408:
      case 504:
        errorCode = ErrorCode.TIMEOUT;
        break;
      case 409:
        errorCode = ErrorCode.CONFLICT;
        break;
      default:
        if (httpStatus >= 400 && httpStatus < 500) {
          // Other 4xx errors
          errorCode = ErrorCode.BAD_USER_INPUT;
        } else {
          // 5xx errors default to internal server error
          errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
        }
    }
  }

  return new BaseGraphQLError(error.message, errorCode, error.extensions);
};
