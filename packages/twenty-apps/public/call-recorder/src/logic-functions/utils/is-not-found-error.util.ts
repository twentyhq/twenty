import { isArray, isObject } from '@sniptt/guards';

const NOT_FOUND_ERROR_CODE = 'NOT_FOUND';

export const isNotFoundError = (error: unknown): boolean => {
  if (!isObject(error) || !('errors' in error) || !isArray(error.errors)) {
    return false;
  }

  return error.errors.some(
    (graphqlError) =>
      isObject(graphqlError) &&
      'extensions' in graphqlError &&
      isObject(graphqlError.extensions) &&
      'code' in graphqlError.extensions &&
      graphqlError.extensions.code === NOT_FOUND_ERROR_CODE,
  );
};
