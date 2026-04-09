import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { formatAddressDisplay } from '~/utils/formatAddressDisplay';

describe('formatAddressDisplay', () => {
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

  it('should return empty string when fieldValue is undefined', () => {
    const result = formatAddressDisplay(undefined, ['addressStreet1']);
    expect(result).toBe('');
  });

  it('should return empty string when fieldValue is null', () => {
    const result = formatAddressDisplay(null as any, ['addressStreet1']);
    expect(result).toBe('');
  });

  it('should format address with specified subFields', () => {
    const result = formatAddressDisplay(mockAddressValue, [
      'addressStreet1',
      'addressCity',
      'addressState',
    ]);
    expect(result).toBe('123 Main St,New York,NY');
  });

  it('should format address with all fields when subFields is null', () => {
    const result = formatAddressDisplay(mockAddressValue, null);
    expect(result).toBe('123 Main St,Apt 4B,New York,NY,10001,United States');
  });

  it('should format address with all fields when subFields is undefined', () => {
    const result = formatAddressDisplay(mockAddressValue, undefined);
    expect(result).toBe('123 Main St,Apt 4B,New York,NY,10001,United States');
  });

  it('should format address with all fields when subFields is empty array', () => {
    const result = formatAddressDisplay(mockAddressValue, []);
    expect(result).toBe('123 Main St,Apt 4B,New York,NY,10001,United States');
  });

  it('should handle address with some empty fields', () => {
    const partialAddress: FieldAddressValue = {
      addressStreet1: '456 Oak Ave',
      addressStreet2: null,
      addressCity: 'Boston',
      addressState: null,
      addressPostcode: '02101',
      addressCountry: 'United States',
      addressLat: null,
      addressLng: null,
    };

    const result = formatAddressDisplay(partialAddress, [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
    ]);
    expect(result).toBe('456 Oak Ave,Boston,02101');
  });

  it('should handle single field selection', () => {
    const result = formatAddressDisplay(mockAddressValue, ['addressCity']);
    expect(result).toBe('New York');
  });

  it('should handle empty address object', () => {
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

    const result = formatAddressDisplay(emptyAddress, [
      'addressStreet1',
      'addressCity',
    ]);
    expect(result).toBe('');
  });
});
