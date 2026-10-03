import { FieldMetadataType } from 'twenty-shared/types';

import { formatProposedFieldValue } from '@/ai/utils/formatProposedFieldValue';

describe('formatProposedFieldValue', () => {
  it.each([
    ['nothing', null, null],
    ['an empty string', '', null],
    ['a number', 42, '42'],
    ['a boolean', false, 'false'],
    ['a list', ['VIP', 'Partner'], 'VIP, Partner'],

    ['a full name', { firstName: 'Tim', lastName: 'Cook' }, 'Tim Cook'],
    ['an empty composite', { firstName: '', lastName: '' }, null],
    [
      'a composite whose only value is nested',
      { primaryEmail: '', additionalEmails: ['tim@apple.dev'] },
      'tim@apple.dev',
    ],
  ])('formats %s', (_description, value, expected) => {
    expect(formatProposedFieldValue(value)).toBe(expected);
  });

  it('reads an amount in a currency field', () => {
    expect(
      formatProposedFieldValue(
        { amountMicros: 120_000_000_000, currencyCode: 'EUR' },
        FieldMetadataType.CURRENCY,
      ),
    ).toBe('120000 EUR');
  });

  it('leaves amountMicros alone outside a currency field', () => {
    expect(formatProposedFieldValue({ amountMicros: 5 })).toBe('5');
  });
});
