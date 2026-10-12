import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export const getValidationRuleFormValuesFromAiChatFill = ({
  values,
  filledValues,
  fieldMetadataItems,
}: {
  values: ValidationRuleFormValues;
  filledValues: Record<string, string>;
  fieldMetadataItems: Pick<FieldMetadataItem, 'id' | 'name'>[];
}): ValidationRuleFormValues => {
  const { name, expression, message, errorFieldName } = filledValues;

  return {
    ...values,
    name: name ?? values.name,
    expression: expression ?? values.expression,
    message: message ?? values.message,
    errorFieldMetadataId: isDefined(errorFieldName)
      ? (fieldMetadataItems.find(
          (fieldMetadataItem) => fieldMetadataItem.name === errorFieldName,
        )?.id ?? null)
      : values.errorFieldMetadataId,
  };
};
