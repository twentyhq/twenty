import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const mergeServerValidationRuleFormValues = ({
  formValues,
  previousServerFormValues,
  nextServerFormValues,
}: {
  formValues: ValidationRuleFormValues;
  previousServerFormValues: ValidationRuleFormValues;
  nextServerFormValues: ValidationRuleFormValues;
}): ValidationRuleFormValues => {
  const isUntouched = (fieldName: keyof ValidationRuleFormValues) =>
    isDeeplyEqual(formValues[fieldName], previousServerFormValues[fieldName]);

  return {
    name: isUntouched('name') ? nextServerFormValues.name : formValues.name,
    description: isUntouched('description')
      ? nextServerFormValues.description
      : formValues.description,
    icon: isUntouched('icon') ? nextServerFormValues.icon : formValues.icon,
    expression: isUntouched('expression')
      ? nextServerFormValues.expression
      : formValues.expression,
    message: isUntouched('message')
      ? nextServerFormValues.message
      : formValues.message,
    errorFieldMetadataId: isUntouched('errorFieldMetadataId')
      ? nextServerFormValues.errorFieldMetadataId
      : formValues.errorFieldMetadataId,
  };
};
