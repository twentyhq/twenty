import { isArray, isObject } from '@sniptt/guards';

const FORBIDDEN_ERROR_CODE = 'FORBIDDEN';

export const isPermissionDeniedError = (error: unknown): boolean => {
  if (!isObject(error) || !('errors' in error) || !isArray(error.errors)) {
    return false;
  }

  return error.errors.some(
    (graphqlError) =>
      isObject(graphqlError) &&
      'extensions' in graphqlError &&
      isObject(graphqlError.extensions) &&
      'code' in graphqlError.extensions &&
      graphqlError.extensions.code === FORBIDDEN_ERROR_CODE,
  );
};
