import { FieldMetadataType } from 'twenty-shared/types';

import { compareDimensionValues } from 'src/modules/dashboard/chart-data/utils/compare-dimension-values.util';

describe('compareDimensionValues', () => {
  describe('string comparison (default)', () => {
    it('should compare strings alphabetically in ascending order', () => {
      const result = compareDimensionValues({
        rawValueA: 'Alpha',
        rawValueB: 'Beta',
        formattedValueA: 'Alpha',
        formattedValueB: 'Beta',
        direction: 'ASC',
      });

      expect(result).toBeLessThan(0);
    });

    it('should compare strings alphabetically in descending order', () => {
      const result = compareDimensionValues({
        rawValueA: 'Alpha',
        rawValueB: 'Beta',
        formattedValueA: 'Alpha',
        formattedValueB: 'Beta',
        direction: 'DESC',
      });

      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for equal strings', () => {
      const result = compareDimensionValues({
        rawValueA: 'Alpha',
        rawValueB: 'Alpha',
        formattedValueA: 'Alpha',
        formattedValueB: 'Alpha',
        direction: 'ASC',
      });

      expect(result).toBe(0);
    });
  });

  describe('date comparison', () => {
    it('should compare dates in ascending order', () => {
      const result = compareDimensionValues({
        rawValueA: '2024-01-01',
        rawValueB: '2024-02-01',
        formattedValueA: 'Jan 1, 2024',
        formattedValueB: 'Feb 1, 2024',
        direction: 'ASC',
        fieldType: FieldMetadataType.DATE,
      });

      expect(result).toBeLessThan(0);
    });

    it('should compare dates in descending order', () => {
      const result = compareDimensionValues({
        rawValueA: '2024-01-01',
        rawValueB: '2024-02-01',
        formattedValueA: 'Jan 1, 2024',
        formattedValueB: 'Feb 1, 2024',
        direction: 'DESC',
        fieldType: FieldMetadataType.DATE,
      });

      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for equal dates', () => {
      const result = compareDimensionValues({
        rawValueA: '2024-01-01',
        rawValueB: '2024-01-01',
        formattedValueA: 'Jan 1, 2024',
        formattedValueB: 'Jan 1, 2024',
        direction: 'ASC',
        fieldType: FieldMetadataType.DATE,
      });

      expect(result).toBe(0);
    });

    it('should compare datetime values', () => {
      const result = compareDimensionValues({
        rawValueA: '2024-01-01',
        rawValueB: '2024-06-15',
        formattedValueA: 'Jan 1, 2024',
        formattedValueB: 'Jun 15, 2024',
        direction: 'ASC',
        fieldType: FieldMetadataType.DATE_TIME,
      });

      expect(result).toBeLessThan(0);
    });
  });

  describe('numeric comparison', () => {
    it('should compare numbers in ascending order', () => {
      const result = compareDimensionValues({
        rawValueA: 100,
        rawValueB: 200,
        formattedValueA: '100',
        formattedValueB: '200',
        direction: 'ASC',
        fieldType: FieldMetadataType.NUMBER,
      });

      expect(result).toBeLessThan(0);
    });

    it('should compare numbers in descending order', () => {
      const result = compareDimensionValues({
        rawValueA: 100,
        rawValueB: 200,
        formattedValueA: '100',
        formattedValueB: '200',
        direction: 'DESC',
        fieldType: FieldMetadataType.NUMBER,
      });

      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for equal numbers', () => {
      const result = compareDimensionValues({
        rawValueA: 100,
        rawValueB: 100,
        formattedValueA: '100',
        formattedValueB: '100',
        direction: 'ASC',
        fieldType: FieldMetadataType.NUMBER,
      });

      expect(result).toBe(0);
    });

    it('should handle string number values', () => {
      const result = compareDimensionValues({
        rawValueA: '100',
        rawValueB: '200',
        formattedValueA: '100',
        formattedValueB: '200',
        direction: 'ASC',
        fieldType: FieldMetadataType.NUMBER,
      });

      expect(result).toBeLessThan(0);
    });
  });

  describe('currency comparison', () => {
    it('should compare currency amountMicros numerically', () => {
      const result = compareDimensionValues({
        rawValueA: 1000000,
        rawValueB: 2000000,
        formattedValueA: '$1.00',
        formattedValueB: '$2.00',
        direction: 'ASC',
        fieldType: FieldMetadataType.CURRENCY,
        subFieldName: 'amountMicros',
      });

      expect(result).toBeLessThan(0);
    });

    it('should compare currency code alphabetically', () => {
      const result = compareDimensionValues({
        rawValueA: 'EUR',
        rawValueB: 'USD',
        formattedValueA: 'EUR',
        formattedValueB: 'USD',
        direction: 'ASC',
        fieldType: FieldMetadataType.CURRENCY,
        subFieldName: 'currencyCode',
      });

      expect(result).toBeLessThan(0);
    });
  });

  describe('edge cases', () => {
    it('should fall back to string comparison when raw values are undefined', () => {
      const result = compareDimensionValues({
        rawValueA: undefined,
        rawValueB: undefined,
        formattedValueA: 'Alpha',
        formattedValueB: 'Beta',
        direction: 'ASC',
        fieldType: FieldMetadataType.NUMBER,
      });

      expect(result).toBeLessThan(0);
    });

    it('should use formatted values when one raw value is undefined', () => {
      const result = compareDimensionValues({
        rawValueA: 100,
        rawValueB: undefined,
        formattedValueA: '100',
        formattedValueB: '200',
        direction: 'ASC',
        fieldType: FieldMetadataType.NUMBER,
      });

      expect(result).toBeLessThan(0);
    });

    it('should use formatted values when field type is not provided', () => {
      const result = compareDimensionValues({
        rawValueA: '100',
        rawValueB: '200',
        formattedValueA: 'One Hundred',
        formattedValueB: 'Two Hundred',
        direction: 'ASC',
      });

      // Uses localeCompare on formatted values
      expect(result).toBeLessThan(0);
    });
  });
});
