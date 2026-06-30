import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAddressFieldValueForPersist } from '~/utils/normalize-address-field-value-for-persist';

describe('normalizeAddressFieldValueForPersist', () => {
  it('should set coordinates to null when all text subfields are empty', () => {
    const input: FieldAddressValue = {
      addressStreet1: '',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressPostcode: null,
      addressCountry: null,
      addressLat: 40.7128,
      addressLng: -74.006,
    };

    const result = normalizeAddressFieldValueForPersist(input);

    expect(result.addressLat).toBeNull();
    expect(result.addressLng).toBeNull();
  });

  it('should preserve coordinates when any text subfield is non-empty', () => {
    const input: FieldAddressValue = {
      addressStreet1: '1600 Amphitheatre',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressPostcode: null,
      addressCountry: null,
      addressLat: 37.422,
      addressLng: -122.084,
    };

    const result = normalizeAddressFieldValueForPersist(input);

    expect(result.addressLat).toBe(37.422);
    expect(result.addressLng).toBe(-122.084);
  });
});
