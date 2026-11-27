import { isNonEmptyString } from '@sniptt/guards';
import {
  type FieldMetadataFormulaEvaluation,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFormulaEvaluationFromBindings,
} from 'twenty-shared/utils';

export const getFormulaExpressionEvaluation = ({
  expression,
  fields,
}: {
  expression?: string;
  fields: ValidationRuleFieldDescriptor[];
}): FieldMetadataFormulaEvaluation | undefined => {
  if (!isNonEmptyString(expression)) {
    return undefined;
  }

  const compilation = compileFormulaExpression({ expression, fields });

  return compilation.isValid
    ? getFormulaEvaluationFromBindings({
        bindings: compilation.bindings,
        fields,
      })
    : undefined;
};
