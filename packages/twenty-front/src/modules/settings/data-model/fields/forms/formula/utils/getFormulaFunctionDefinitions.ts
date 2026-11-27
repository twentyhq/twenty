import { FORMULA_AGGREGATE_FUNCTION_NAMES } from 'twenty-shared/constants';

import { FORMULA_AGGREGATE_FUNCTION_DEFINITIONS } from '@/settings/data-model/fields/forms/formula/constants/FormulaAggregateFunctionDefinitions';
import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';
import { getValidationRuleFunctionDefinitions } from '@/validation-rules/utils/getValidationRuleFunctionDefinitions';

// The aggregate definitions of min and max cover their scalar form too
export const getFormulaFunctionDefinitions =
  (): ValidationRuleSyntaxDefinition[] => [
    ...getValidationRuleFunctionDefinitions().filter(
      ({ name }) =>
        !FORMULA_AGGREGATE_FUNCTION_NAMES.some(
          (aggregateFunctionName) => aggregateFunctionName === name,
        ),
    ),
    ...FORMULA_AGGREGATE_FUNCTION_DEFINITIONS,
  ];
