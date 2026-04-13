import { isPlainObject } from 'twenty-shared/utils';

type GraphQLErrorEntry = {
  message?: string;
  extensions?: {
    code?: string;
    subCode?: string;
  };
};

type OAuthErrorBody = {
  error?: string;
  error_description?: string;
};

const asGraphQLErrorEntry = (value: unknown): GraphQLErrorEntry | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  return value as GraphQLErrorEntry;
};

export const getGraphQLErrorCode = (error: unknown): string | undefined => {
  return asGraphQLErrorEntry(error)?.extensions?.code;
};

export const getGraphQLErrorSubCode = (error: unknown): string | undefined => {
  return asGraphQLErrorEntry(error)?.extensions?.subCode;
};

export const hasGraphQLErrorSubCode = (
  error: unknown,
  subCode: string,
): boolean => {
  return getGraphQLErrorSubCode(error) === subCode;
};

export const isGraphQLNotFoundError = (error: unknown): boolean => {
  return getGraphQLErrorCode(error) === 'NOT_FOUND';
};

export const getOAuthError = (body: unknown): string | undefined => {
  if (!isPlainObject(body)) {
    return undefined;
  }

  const { error } = body as OAuthErrorBody;

  return typeof error === 'string' ? error : undefined;
};

export const isOAuthInvalidClientError = (body: unknown): boolean => {
  return getOAuthError(body) === 'invalid_client';
};
