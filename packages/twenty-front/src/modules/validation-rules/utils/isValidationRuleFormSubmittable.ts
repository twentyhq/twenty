import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isNonEmptyString,
} from 'twenty-shared/utils';

import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export const isValidationRuleFormSubmittable = ({
  values,
  fields,
}: {
  values: ValidationRuleFormValues;
  fields: ValidationRuleFieldDescriptor[];
}): boolean =>
  isNonEmptyString(values.message.trim()) &&
  compileValidationRuleExpression({ expression: values.expression, fields })
    .isValid;
