import { type ValidationRuleBindings } from 'twenty-shared/types';

export type ValidationRuleFormValues = {
  name: string;
  description: string | null;
  icon: string;
  expression: string;
  bindings: ValidationRuleBindings;
  message: string;
  errorFieldMetadataId: string | null;
};
