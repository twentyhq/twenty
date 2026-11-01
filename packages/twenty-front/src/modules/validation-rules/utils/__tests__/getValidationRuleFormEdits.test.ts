import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { getValidationRuleFormEdits } from '@/validation-rules/utils/getValidationRuleFormEdits';

const SERVER_FORM_VALUES: ValidationRuleFormValues = {
  name: 'Positive revenue',
  description: null,
  icon: 'IconShieldCheck',
  expression: 'annualRecurringRevenue > 0',
  message: 'Revenue must be positive',
  errorFieldMetadataId: null,
};

describe('getValidationRuleFormEdits', () => {
  it('should keep only the fields that differ from the server', () => {
    expect(
      getValidationRuleFormEdits({
        formValues: { ...SERVER_FORM_VALUES, name: 'Revenue above zero' },
        serverFormValues: SERVER_FORM_VALUES,
      }),
    ).toEqual({ name: 'Revenue above zero' });
  });

  it('should drop a field changed back to its server value', () => {
    expect(
      getValidationRuleFormEdits({
        formValues: SERVER_FORM_VALUES,
        serverFormValues: SERVER_FORM_VALUES,
      }),
    ).toEqual({});
  });
});
