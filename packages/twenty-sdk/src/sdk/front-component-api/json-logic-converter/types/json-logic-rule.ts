import { isPlainObject } from 'twenty-shared/utils';

export type JsonLogicOperator =
  | 'and'
  | 'or'
  | 'if'
  | '!'
  | '!!'
  | '==='
  | '!=='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'in'
  | 'some'
  | 'var'
  | 'isDefined'
  | 'isNonEmptyString'
  | 'hasReadPermission'
  | 'hasWritePermission'
  | 'isFeatureFlagEnabled'
  | 'areWorkflowTriggerAndStepsDefined';

export type JsonLogicPrimitive = boolean | string | number | null;

export type JsonLogicObject = {
  [K in JsonLogicOperator]?: JsonLogicRule[] | JsonLogicRule;
};

export type JsonLogicRule =
  | JsonLogicPrimitive
  | JsonLogicObject
  | JsonLogicRule[];

export const isJsonLogicObject = (
  rule: JsonLogicRule,
): rule is JsonLogicObject => isPlainObject(rule) && !Array.isArray(rule);
