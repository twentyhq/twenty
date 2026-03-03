import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

const { CONNECT, DISCONNECT } = RELATION_NESTED_QUERY_KEYWORDS;

export const isRelationNestedOperation = (value: unknown): boolean => {
  if (!isDefined(value) || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    (CONNECT in obj && isDefined(obj[CONNECT])) ||
    (DISCONNECT in obj && isDefined(obj[DISCONNECT]))
  );
};
