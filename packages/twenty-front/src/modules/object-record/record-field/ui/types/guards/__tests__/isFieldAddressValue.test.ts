import {
  isFieldAddressValue,
  addressSchema,
} from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';

describe('isFieldAddressValue', () => {
  it('should return true for valid address values', () => {
    expect(
      isFieldAddressValue({
        addressStreet1: '123 Main St',
        addressStreet2: null,
        addressCity: 'Paris',
        addressState: null,
        addressPostcode: '75001',
        addressCountry: 'France',
        addressLat: 48.8566,
        addressLng: 2.3522,
      }),
    ).toBe(true);
  });

  it('should return true for minimal address with all nullable fields null', () => {
    expect(
      isFieldAddressValue({
        addressStreet1: '',
        addressStreet2: null,
        addressCity: null,
        addressState: null,
        addressPostcode: null,
        addressCountry: null,
        addressLat: null,
        addressLng: null,
      }),
    ).toBe(true);
  });

  it('should return false for incomplete address', () => {
    expect(isFieldAddressValue({ addressStreet1: '123 Main St' })).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isFieldAddressValue(null)).toBe(false);
    expect(isFieldAddressValue('address')).toBe(false);
  });
});

describe('addressSchema', () => {
  it('should parse a valid address', () => {
    const result = addressSchema.safeParse({
      addressStreet1: '123 Main St',
      addressStreet2: null,
      addressCity: 'Paris',
      addressState: null,
      addressPostcode: '75001',
      addressCountry: 'France',
      addressLat: null,
      addressLng: null,
    });

    expect(result.success).toBe(true);
  });
});
