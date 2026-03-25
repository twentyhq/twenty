import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { serializeChartBucketValueForFilter } from '@/page-layout/widgets/graph/utils/serializeChartBucketValueForFilter';

describe('serializeChartBucketValueForFilter', () => {
  describe('fields requiring JSON array with IS operand', () => {
    it('should wrap SELECT field value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.SELECT,
        bucketRawValue: 'option1',
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('["option1"]');
    });

    it('should wrap UUID field value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.UUID,
        bucketRawValue: '123e4567-e89b-12d3-a456-426614174000',
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('["123e4567-e89b-12d3-a456-426614174000"]');
    });

    it('should wrap RELATION field value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.RELATION,
        bucketRawValue: 'relation-id',
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('["relation-id"]');
    });

    it('should wrap CURRENCY currencyCode subfield value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.CURRENCY,
        bucketRawValue: 'EUR',
        operand: ViewFilterOperand.IS,
        subFieldName: 'currencyCode',
      });

      expect(result).toBe('["EUR"]');
    });

    it('should not wrap CURRENCY amountMicros subfield value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.CURRENCY,
        bucketRawValue: '1000000',
        operand: ViewFilterOperand.IS,
        subFieldName: 'amountMicros',
      });

      expect(result).toBe('1000000');
    });
  });

  describe('fields requiring JSON array with CONTAINS operand', () => {
    it('should wrap MULTI_SELECT field value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.MULTI_SELECT,
        bucketRawValue: 'option1',
        operand: ViewFilterOperand.CONTAINS,
      });

      expect(result).toBe('["option1"]');
    });

    it('should wrap ADDRESS addressCountry subfield value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.ADDRESS,
        bucketRawValue: 'US',
        operand: ViewFilterOperand.CONTAINS,
        subFieldName: 'addressCountry',
      });

      expect(result).toBe('["US"]');
    });

    it('should not wrap ADDRESS addressStreet1 subfield value in JSON array', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.ADDRESS,
        bucketRawValue: '123 Main St',
        operand: ViewFilterOperand.CONTAINS,
        subFieldName: 'addressStreet1',
      });

      expect(result).toBe('123 Main St');
    });
  });

  describe('fields not requiring JSON array', () => {
    it('should not wrap TEXT field value', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.TEXT,
        bucketRawValue: 'some text',
        operand: ViewFilterOperand.CONTAINS,
      });

      expect(result).toBe('some text');
    });

    it('should not wrap NUMBER field value', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.NUMBER,
        bucketRawValue: '42',
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('42');
    });

    it('should not wrap BOOLEAN field value', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.BOOLEAN,
        bucketRawValue: 'true',
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('true');
    });

    it('should not wrap SELECT field with non-IS operand', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.SELECT,
        bucketRawValue: 'option1',
        operand: ViewFilterOperand.IS_NOT,
      });

      expect(result).toBe('option1');
    });

    it('should not wrap MULTI_SELECT field with non-CONTAINS operand', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.MULTI_SELECT,
        bucketRawValue: 'option1',
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
      });

      expect(result).toBe('option1');
    });
  });

  describe('value conversion', () => {
    it('should convert number to string', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.NUMBER,
        bucketRawValue: 123,
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('123');
    });

    it('should convert boolean to string', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.BOOLEAN,
        bucketRawValue: true,
        operand: ViewFilterOperand.IS,
      });

      expect(result).toBe('true');
    });

    it('should handle null subFieldName', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.SELECT,
        bucketRawValue: 'option1',
        operand: ViewFilterOperand.IS,
        subFieldName: null,
      });

      expect(result).toBe('["option1"]');
    });

    it('should handle undefined subFieldName', () => {
      const result = serializeChartBucketValueForFilter({
        fieldType: FieldMetadataType.SELECT,
        bucketRawValue: 'option1',
        operand: ViewFilterOperand.IS,
        subFieldName: undefined,
      });

      expect(result).toBe('["option1"]');
    });
  });
});
