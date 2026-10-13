import { typedObjectEntries } from 'twenty-shared/utils';

import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export const getValidationRuleFormEdits = ({
  formValues,
  serverFormValues,
}: {
  formValues: ValidationRuleFormValues;
  serverFormValues: ValidationRuleFormValues;
}): Partial<ValidationRuleFormValues> =>
  typedObjectEntries(formValues).reduce<Partial<ValidationRuleFormValues>>(
    (formEdits, [fieldName, value]) =>
      value === serverFormValues[fieldName]
        ? formEdits
        : { ...formEdits, [fieldName]: value },
    {},
  );
