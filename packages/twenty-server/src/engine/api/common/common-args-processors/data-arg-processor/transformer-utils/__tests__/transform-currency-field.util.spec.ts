import { transformCurrencyField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-currency-field.util';

describe('transformCurrencyField', () => {
  it('should return null when value is null', () => {
    const result = transformCurrencyField(null);

    expect(result).toBeNull();
  });

  it('should return empty object when value is empty object', () => {
    const result = transformCurrencyField({});

    expect(result).toEqual({});
  });

  it('should transform amountMicros from number', () => {
    const result = transformCurrencyField({ amountMicros: 1000 });

    expect(result).toEqual({ amountMicros: 1000 });
  });

  it('should transform amountMicros from string to number', () => {
    const result = transformCurrencyField({ amountMicros: '1000' });

    expect(result).toEqual({ amountMicros: 1000 });
  });

  it('should transform currencyCode', () => {
    const result = transformCurrencyField({ currencyCode: 'USD' });

    expect(result).toEqual({ currencyCode: 'USD' });
  });

  it('should transform both amountMicros and currencyCode', () => {
    const result = transformCurrencyField({
      amountMicros: '2500',
      currencyCode: 'EUR',
    });

    expect(result).toEqual({ amountMicros: 2500, currencyCode: 'EUR' });
  });

  it('should handle null amountMicros', () => {
    const result = transformCurrencyField({ amountMicros: null });

    expect(result).toEqual({ amountMicros: null });
  });

  it('should handle null currencyCode', () => {
    const result = transformCurrencyField({ currencyCode: null });

    expect(result).toEqual({ currencyCode: null });
  });
});
