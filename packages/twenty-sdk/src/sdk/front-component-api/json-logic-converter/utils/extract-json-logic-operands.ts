import { isPlainObject } from 'twenty-shared/utils';

import { type JsonLogicRule } from '../types/json-logic-rule';

export const extractJsonLogicOperands = (
  rule: JsonLogicRule,
  operatorKey: string,
): JsonLogicRule[] => {
  if (isPlainObject(rule) && operatorKey in rule) {
    return (rule as Record<string, JsonLogicRule>)[
      operatorKey
    ] as JsonLogicRule[];
  }

  return [rule];
};
