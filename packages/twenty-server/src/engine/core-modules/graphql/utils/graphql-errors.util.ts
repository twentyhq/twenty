import {
  ASTNode,
  GraphQLError,
  GraphQLFormattedError,
  Source,
  SourceLocation,
} from 'graphql';

declare module 'graphql' {
  export interface GraphQLErrorExtensions {
    exception?: {
      code?: string;
      stacktrace?: ReadonlyArray<string>;
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
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export class BaseGraphQLError extends GraphQLError {
  public extensions: Record<string, any>;
  override readonly name!: string;
  readonly locations: ReadonlyArray<SourceLocation> | undefined;
  readonly path: ReadonlyArray<string | number> | undefined;
  readonly source: Source | undefined;
  readonly positions: ReadonlyArray<number> | undefined;
  readonly nodes: ReadonlyArray<ASTNode> | undefined;
  public originalError: Error | undefined;

  [key: string]: any;

  constructor(
    message: string,
    code?: string,
    extensions?: Record<string, any>,
  ) {
    super(message);

    // if no name provided, use the default. defineProperty ensures that it stays non-enumerable
    if (!this.name) {
      Object.defineProperty(this, 'name', { value: 'ApolloError' });
    }

    if (extensions?.extensions) {
      throw new Error(
        'Pass extensions directly as the third argument of the ApolloError constructor: `new ' +
          'ApolloError(message, code, {myExt: value})`, not `new ApolloError(message, code, ' +
          '{extensions: {myExt: value}})`',
      );
    }

    this.extensions = { ...extensions, code };
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
  constructor(message: string) {
    super(message, ErrorCode.GRAPHQL_VALIDATION_FAILED);

    Object.defineProperty(this, 'name', { value: 'ValidationError' });
  }
}

export class AuthenticationError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.UNAUTHENTICATED);

    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}

export class ForbiddenError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.FORBIDDEN);

    Object.defineProperty(this, 'name', { value: 'ForbiddenError' });
  }
}

export class PersistedQueryNotFoundError extends BaseGraphQLError {
  constructor() {
    super('PersistedQueryNotFound', ErrorCode.PERSISTED_QUERY_NOT_FOUND);

    Object.defineProperty(this, 'name', {
      value: 'PersistedQueryNotFoundError',
    });
  }
}

export class PersistedQueryNotSupportedError extends BaseGraphQLError {
  constructor() {
    super(
      'PersistedQueryNotSupported',
      ErrorCode.PERSISTED_QUERY_NOT_SUPPORTED,
    );

    Object.defineProperty(this, 'name', {
      value: 'PersistedQueryNotSupportedError',
    });
  }
}

export class UserInputError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.BAD_USER_INPUT);

    Object.defineProperty(this, 'name', { value: 'UserInputError' });
  }
}

export class NotFoundError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.NOT_FOUND);

    Object.defineProperty(this, 'name', { value: 'NotFoundError' });
  }
}

export class EmailNotVerifiedError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.EMAIL_NOT_VERIFIED);

    Object.defineProperty(this, 'name', { value: 'EmailNotVerifiedError' });
  }
}

export class MethodNotAllowedError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.METHOD_NOT_ALLOWED);

    Object.defineProperty(this, 'name', { value: 'MethodNotAllowedError' });
  }
}

export class ConflictError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT);

    Object.defineProperty(this, 'name', { value: 'ConflictError' });
  }
}

export class TimeoutError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.TIMEOUT);

    Object.defineProperty(this, 'name', { value: 'TimeoutError' });
  }
}

export class InternalServerError extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ErrorCode.INTERNAL_SERVER_ERROR);

    Object.defineProperty(this, 'name', { value: 'InternalServerError' });
  }
}
