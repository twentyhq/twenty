import { formatValidationRulePreviewValue } from '@/validation-rules/utils/formatValidationRulePreviewValue';

describe('formatValidationRulePreviewValue', () => {
  it('should render nothing for a missing value', () => {
    expect(formatValidationRulePreviewValue(null)).toBe('');
  });

  it('should render a related record by its name, including a full name', () => {
    expect(
      formatValidationRulePreviewValue({
        __typename: 'Person',
        id: 'person-id',
        name: {
          __typename: 'FullName',
          firstName: 'Ada',
          lastName: 'Lovelace',
        },
        city: 'London',
      }),
    ).toBe('Ada Lovelace');
  });

  it('should join the filled parts of a composite value', () => {
    expect(
      formatValidationRulePreviewValue({
        __typename: 'Currency',
        amountMicros: 12000000,
        currencyCode: 'EUR',
      }),
    ).toBe('12000000 EUR');
  });

  it('should join list items', () => {
    expect(formatValidationRulePreviewValue(['A', null, 'B'])).toBe('A, B');
  });
});
