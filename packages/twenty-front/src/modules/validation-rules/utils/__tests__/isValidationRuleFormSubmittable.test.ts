import { FieldMetadataType } from 'twenty-shared/types';

import { isValidationRuleFormSubmittable } from '@/validation-rules/utils/isValidationRuleFormSubmittable';

const FIELDS = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage',
  },
];

const VALID_VALUES = {
  name: 'No won deals yet',
  description: null,
  icon: 'IconListCheck',
  expression: 'stage != "WON"',
  message: 'Deals cannot be won yet',
  errorFieldMetadataId: null,
};

describe('isValidationRuleFormSubmittable', () => {
  it('should accept a compiling expression with a name and a message', () => {
    expect(
      isValidationRuleFormSubmittable({ values: VALID_VALUES, fields: FIELDS }),
    ).toBe(true);
  });

  it('should refuse a blank name', () => {
    expect(
      isValidationRuleFormSubmittable({
        values: { ...VALID_VALUES, name: '  ' },
        fields: FIELDS,
      }),
    ).toBe(false);
  });

  it('should refuse a blank message', () => {
    expect(
      isValidationRuleFormSubmittable({
        values: { ...VALID_VALUES, message: '  ' },
        fields: FIELDS,
      }),
    ).toBe(false);
  });

  it('should refuse an expression that does not compile', () => {
    expect(
      isValidationRuleFormSubmittable({
        values: { ...VALID_VALUES, expression: 'stag != "WON"' },
        fields: FIELDS,
      }),
    ).toBe(false);
  });
});
