import { isPlainObject } from 'twenty-shared/utils';

import type { JsonLogicObject } from '../types/json-logic-object';
import type { JsonLogicOperator } from '../types/json-logic-operator';
import type { JsonLogicRule } from '../types/json-logic-rule';

const isJsonLogicObject = (rule: JsonLogicRule): rule is JsonLogicObject =>
  isPlainObject(rule) && !Array.isArray(rule);

export const extractJsonLogicOperands = ({
  rule,
  operatorKey,
}: {
  rule: JsonLogicRule;
  operatorKey: JsonLogicOperator;
}): JsonLogicRule[] => {
  if (isJsonLogicObject(rule) && operatorKey in rule) {
    const operands = rule[operatorKey];

    if (Array.isArray(operands)) {
      return operands;
    }
  }

  return [rule];
};
