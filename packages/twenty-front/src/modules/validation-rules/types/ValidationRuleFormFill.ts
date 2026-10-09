import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export type ValidationRuleFormFill = Pick<
  ValidationRuleFormValues,
  'name' | 'expression' | 'message' | 'errorFieldMetadataId'
> & {
  objectMetadataId: string;
  validationRuleId: string | null;
};
