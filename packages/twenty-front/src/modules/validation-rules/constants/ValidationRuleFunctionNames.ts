import { validationRuleParser } from 'twenty-shared/utils';

export const VALIDATION_RULE_FUNCTION_NAMES: string[] = Object.keys(
  validationRuleParser.functions,
);
