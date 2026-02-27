import {
  isJsonLogicObject,
  type JsonLogicOperator,
  type JsonLogicRule,
} from '../types/json-logic-rule';

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
