import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const isRelationNestedOperation = (value: unknown): boolean => {
  if (!isDefined(value) || typeof value !== 'object') {
    return false;
  }

  return Object.keys(value).some(
    (key) =>
      key === RELATION_NESTED_QUERY_KEYWORDS.CONNECT ||
      key === RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT,
  );
};
