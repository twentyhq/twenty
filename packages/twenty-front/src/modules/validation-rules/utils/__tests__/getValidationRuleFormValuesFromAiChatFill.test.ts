import { getValidationRuleFormValuesFromAiChatFill } from '@/validation-rules/utils/getValidationRuleFormValuesFromAiChatFill';

const VALUES = {
  name: 'Old name',
  description: 'Kept',
  icon: 'IconListCheck',
  expression: 'not isEmpty(name)',
  message: 'Old message',
  errorFieldMetadataId: 'field-name',
};

const FIELD_METADATA_ITEMS = [
  { id: 'field-name', name: 'name' },
  { id: 'field-domain', name: 'domainName' },
];

describe('getValidationRuleFormValuesFromAiChatFill', () => {
  it('fills the given values and keeps the others', () => {
    expect(
      getValidationRuleFormValuesFromAiChatFill({
        values: VALUES,
        filledValues: {
          expression: 'not isEmpty(domainName)',
          errorFieldName: 'domainName',
        },
        fieldMetadataItems: FIELD_METADATA_ITEMS,
      }),
    ).toEqual({
      ...VALUES,
      expression: 'not isEmpty(domainName)',
      errorFieldMetadataId: 'field-domain',
    });
  });

  it('shows the message on the whole record when no field is named', () => {
    expect(
      getValidationRuleFormValuesFromAiChatFill({
        values: VALUES,
        filledValues: { errorFieldName: '' },
        fieldMetadataItems: FIELD_METADATA_ITEMS,
      }).errorFieldMetadataId,
    ).toBeNull();
  });
});
