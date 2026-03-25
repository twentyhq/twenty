import { mergeCompositeValues } from '@/object-record/record-table/utils/mergeCompositeValues';

describe('mergeCompositeValues', () => {
  it('should merge two composite objects', () => {
    const existing = { city: 'Paris' };
    const incoming = { country: 'France' };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      city: 'Paris',
      country: 'France',
    });
  });

  it('should override existing keys with incoming keys', () => {
    const existing = { city: 'Paris', country: 'France' };
    const incoming = { city: 'Lyon' };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      city: 'Lyon',
      country: 'France',
    });
  });

  it('should return incoming value when existing is undefined', () => {
    const incoming = { city: 'Paris' };

    expect(mergeCompositeValues(undefined, incoming)).toEqual({
      city: 'Paris',
    });
  });

  it('should merge currency composite values', () => {
    const existing = { currencyCode: 'USD' };
    const incoming = { amountMicros: 1000000 };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      currencyCode: 'USD',
      amountMicros: 1000000,
    });
  });

  it('should merge address composite values', () => {
    const existing = { addressCity: 'Paris' };
    const incoming = { addressCountry: 'France' };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      addressCity: 'Paris',
      addressCountry: 'France',
    });
  });

  it('should merge full name composite values', () => {
    const existing = { firstName: 'John' };
    const incoming = { lastName: 'Doe' };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should merge links composite values', () => {
    const existing = { primaryLinkLabel: 'Website' };
    const incoming = { primaryLinkUrl: 'https://example.com' };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      primaryLinkLabel: 'Website',
      primaryLinkUrl: 'https://example.com',
    });
  });

  it('should merge emails composite values', () => {
    const existing = { primaryEmail: 'john@example.com' };
    const incoming = { additionalEmails: ['jane@example.com'] };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      primaryEmail: 'john@example.com',
      additionalEmails: ['jane@example.com'],
    });
  });

  it('should merge phones composite values', () => {
    const existing = { primaryPhoneNumber: '+1234567890' };
    const incoming = { primaryPhoneCountryCode: '+1' };

    expect(mergeCompositeValues(existing, incoming)).toEqual({
      primaryPhoneNumber: '+1234567890',
      primaryPhoneCountryCode: '+1',
    });
  });

  it('should handle both values being empty objects', () => {
    expect(mergeCompositeValues({}, {})).toEqual({});
  });

  it('should handle empty existing with populated incoming', () => {
    expect(mergeCompositeValues({}, { firstName: 'John' })).toEqual({
      firstName: 'John',
    });
  });

  it('should handle populated existing with empty incoming', () => {
    expect(mergeCompositeValues({ firstName: 'John' }, {})).toEqual({
      firstName: 'John',
    });
  });

  it('should accumulate multiple sub-fields across successive merges', () => {
    const afterFirst = mergeCompositeValues(undefined, {
      addressStreet1: '123 Main St',
    });
    const afterSecond = mergeCompositeValues(afterFirst, {
      addressCity: 'Paris',
    });
    const afterThird = mergeCompositeValues(afterSecond, {
      addressCountry: 'France',
    });

    expect(afterThird).toEqual({
      addressStreet1: '123 Main St',
      addressCity: 'Paris',
      addressCountry: 'France',
    });
  });
});
