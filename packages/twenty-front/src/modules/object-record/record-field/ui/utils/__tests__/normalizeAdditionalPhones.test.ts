import { normalizeAdditionalPhones } from '@/object-record/record-field/ui/utils/normalizeAdditionalPhones';

describe('normalizeAdditionalPhones', () => {
  it('should return an empty array when the value is not an array', () => {
    expect(normalizeAdditionalPhones(undefined)).toEqual([]);
    expect(normalizeAdditionalPhones(null)).toEqual([]);
    expect(normalizeAdditionalPhones('not an array')).toEqual([]);
  });

  it('should keep well-formed entries untouched', () => {
    expect(
      normalizeAdditionalPhones([
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      ]),
    ).toEqual([{ number: '987654321', callingCode: '+44', countryCode: 'GB' }]);
  });

  it('should complete missing or null codes', () => {
    expect(
      normalizeAdditionalPhones([
        { number: '555000111', countryCode: null },
        { number: '555000222', callingCode: '+44' },
      ]),
    ).toEqual([
      { number: '555000111', callingCode: '', countryCode: '' },
      { number: '555000222', callingCode: '+44', countryCode: '' },
    ]);
  });

  it('should drop entries without a usable number', () => {
    expect(
      normalizeAdditionalPhones([
        { callingCode: '+44', countryCode: 'GB' },
        { number: '', callingCode: '+33', countryCode: 'FR' },
        { number: null },
        null,
        'not an object',
      ]),
    ).toEqual([]);
  });

  it('should keep well-formed entries when another one is unusable', () => {
    expect(
      normalizeAdditionalPhones([
        { callingCode: '+44', countryCode: 'GB' },
        { number: '111222333', callingCode: '+33', countryCode: 'FR' },
      ]),
    ).toEqual([{ number: '111222333', callingCode: '+33', countryCode: 'FR' }]);
  });
});
