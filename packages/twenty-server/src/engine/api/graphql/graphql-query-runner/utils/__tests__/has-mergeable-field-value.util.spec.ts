import { FieldMetadataType } from 'twenty-shared/types';

import { hasMergeableFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-mergeable-field-value.util';

describe('hasMergeableFieldValue', () => {
  it('should treat a currency with only a currency code as empty', () => {
    expect(
      hasMergeableFieldValue(FieldMetadataType.CURRENCY, {
        amountMicros: null,
        currencyCode: 'USD',
      }),
    ).toBe(false);
  });

  it('should treat a currency with an amount as a value', () => {
    expect(
      hasMergeableFieldValue(FieldMetadataType.CURRENCY, {
        amountMicros: 24000000000,
        currencyCode: 'USD',
      }),
    ).toBe(true);
  });

  it('should treat a zero amount as a value', () => {
    expect(
      hasMergeableFieldValue(FieldMetadataType.CURRENCY, {
        amountMicros: 0,
        currencyCode: 'USD',
      }),
    ).toBe(true);
  });

  it('should keep any filled sub-field as a value for other composite fields', () => {
    expect(
      hasMergeableFieldValue(FieldMetadataType.FULL_NAME, {
        firstName: '',
        lastName: 'Doe',
      }),
    ).toBe(true);
  });
});
