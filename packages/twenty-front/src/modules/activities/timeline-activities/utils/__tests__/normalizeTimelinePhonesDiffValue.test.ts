import { normalizeTimelinePhonesDiffValue } from '@/activities/timeline-activities/utils/normalizeTimelinePhonesDiffValue';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';

describe('normalizeTimelinePhonesDiffValue', () => {
  it('should parse additionalPhones stored as a JSON string', () => {
    const result = normalizeTimelinePhonesDiffValue({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones:
        '[{"number":"987654321","callingCode":"+44","countryCode":"GB"}]',
    });

    expect(result.additionalPhones).toEqual([
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ]);
  });

  it('should keep additional phones visible when the primary number is null', () => {
    const result = normalizeTimelinePhonesDiffValue({
      primaryPhoneNumber: null,
      primaryPhoneCountryCode: null,
      primaryPhoneCallingCode: null,
      additionalPhones:
        '[{"number":"987654321","callingCode":"+44","countryCode":"GB"}]',
    });

    expect(createPhonesFromFieldValue(result)).toEqual([
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ]);
  });

  it('should leave additionalPhones untouched when it is already an array', () => {
    const additionalPhones = [
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ];

    const result = normalizeTimelinePhonesDiffValue({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones,
    });

    expect(result.additionalPhones).toEqual(additionalPhones);
  });

  it('should fall back to null when additionalPhones is not valid JSON', () => {
    const result = normalizeTimelinePhonesDiffValue({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: 'not json',
    });

    expect(result.additionalPhones).toBeNull();
  });

  it('should fall back to null when the parsed value is not an array', () => {
    const result = normalizeTimelinePhonesDiffValue({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: '{"number":"987654321"}',
    });

    expect(result.additionalPhones).toBeNull();
  });

  it('should normalize a missing additionalPhones to null', () => {
    const result = normalizeTimelinePhonesDiffValue({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
    });

    expect(result.additionalPhones).toBeNull();
  });
});
