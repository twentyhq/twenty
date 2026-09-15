import { isFieldAddressValue } from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';

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

  it('should return true when addressStreet1 is null but other subfields are filled', () => {
    expect(
      isFieldAddressValue({
        addressStreet1: null,
        addressStreet2: null,
        addressCity: 'Mountain View',
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
