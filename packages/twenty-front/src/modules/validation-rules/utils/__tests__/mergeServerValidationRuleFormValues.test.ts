import { mergeServerValidationRuleFormValues } from '@/validation-rules/utils/mergeServerValidationRuleFormValues';

const SERVER_FORM_VALUES = {
  name: 'New rule',
  description: null,
  icon: 'IconListCheck',
  expression: '',
  message: '',
  errorFieldMetadataId: null,
};

describe('mergeServerValidationRuleFormValues', () => {
  it('takes the server value for untouched fields and keeps what was typed', () => {
    expect(
      mergeServerValidationRuleFormValues({
        formValues: { ...SERVER_FORM_VALUES, message: 'Typed message' },
        previousServerFormValues: SERVER_FORM_VALUES,
        nextServerFormValues: {
          ...SERVER_FORM_VALUES,
          name: 'Domain required',
          expression: 'not isEmpty(domainName)',
          message: 'Server message',
        },
      }),
    ).toEqual({
      ...SERVER_FORM_VALUES,
      name: 'Domain required',
      expression: 'not isEmpty(domainName)',
      message: 'Typed message',
    });
  });
});
