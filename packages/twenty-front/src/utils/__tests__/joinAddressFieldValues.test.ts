import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { joinAddressFieldValues } from '~/utils/joinAddressFieldValues';

describe('joinAddressFieldValues', () => {
  const mockAddressValue: FieldAddressValue = {
    addressStreet1: '123 Main St',
    addressStreet2: 'Apt 4B',
    addressCity: 'New York',
    addressState: 'NY',
    addressPostcode: '10001',
    addressCountry: 'United States',
    addressLat: 40.7128,
    addressLng: -74.006,
  };

  it('should join specified address fields with commas', () => {
    const result = joinAddressFieldValues(mockAddressValue, [
      'addressStreet1',
      'addressCity',
      'addressState',
    ]);
    expect(result).toBe('123 Main St,New York,NY');
  });

  it('should filter out null and empty string values', () => {
    const addressWithNulls: FieldAddressValue = {
      addressStreet1: '456 Oak Ave',
      addressStreet2: null,
      addressCity: '',
      addressState: 'CA',
      addressPostcode: '90210',
      addressCountry: null,
      addressLat: null,
      addressLng: null,
    };

    const result = joinAddressFieldValues(addressWithNulls, [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ]);
    expect(result).toBe('456 Oak Ave,CA,90210');
  });

  it('should handle empty subFields array', () => {
    const result = joinAddressFieldValues(mockAddressValue, []);
    expect(result).toBe('');
  });

  it('should handle single field', () => {
    const result = joinAddressFieldValues(mockAddressValue, ['addressCity']);
    expect(result).toBe('New York');
  });

  it('should handle all fields', () => {
    const result = joinAddressFieldValues(mockAddressValue, [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ]);
    expect(result).toBe('123 Main St,Apt 4B,New York,NY,10001,United States');
  });

  it('should handle address with empty and null values', () => {
    const emptyAddress: FieldAddressValue = {
      addressStreet1: '',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressPostcode: null,
      addressCountry: null,
      addressLat: null,
      addressLng: null,
    };

    const result = joinAddressFieldValues(emptyAddress, [
      'addressStreet1',
      'addressCity',
      'addressCountry',
    ]);
    expect(result).toBe('');
  });

  it('should handle numeric values correctly', () => {
    const result = joinAddressFieldValues(mockAddressValue, [
      'addressLat',
      'addressLng',
    ]);
    // Note: isNonEmptyString from @sniptt/guards only accepts strings, so numeric values are filtered out
    expect(result).toBe('');
  });

  it('should handle mixed null and valid values', () => {
    const mixedAddress: FieldAddressValue = {
      ...mockAddressValue,
      addressStreet2: null,
      addressState: null,
    };

    const result = joinAddressFieldValues(mixedAddress, [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
    ]);
    expect(result).toBe('123 Main St,New York,10001');
  });
});
