import type { JsonLogicOperator } from './json-logic-operator';
import type { JsonLogicRule } from './json-logic-rule';

export type JsonLogicObject = {
  [K in JsonLogicOperator]?: JsonLogicRule[] | JsonLogicRule;
};
