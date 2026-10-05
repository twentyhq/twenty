import { VALIDATION_RULE_DEFAULT_ICON } from '@/validation-rules/constants/ValidationRuleDefaultIcon';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export const EMPTY_VALIDATION_RULE_FORM_VALUES: ValidationRuleFormValues = {
  name: '',
  description: null,
  icon: VALIDATION_RULE_DEFAULT_ICON,
  expression: '',
  bindings: {},
  message: '',
  errorFieldMetadataId: null,
};
