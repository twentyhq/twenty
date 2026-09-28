import { VALIDATION_RULE_FUNCTIONS } from 'twenty-shared/constants';
import { type ValidationRuleFunctionName } from 'twenty-shared/types';

import { VALIDATION_RULE_FUNCTION_DESCRIPTIONS } from '@/validation-rules/constants/ValidationRuleFunctionDescriptions';
import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';

export const getValidationRuleFunctionDefinitions =
  (): ValidationRuleSyntaxDefinition[] =>
    (
      Object.keys(VALIDATION_RULE_FUNCTIONS) as ValidationRuleFunctionName[]
    ).map((name) => ({
      name,
      signature: VALIDATION_RULE_FUNCTIONS[name].signature,
      description: VALIDATION_RULE_FUNCTION_DESCRIPTIONS[name],
    }));
