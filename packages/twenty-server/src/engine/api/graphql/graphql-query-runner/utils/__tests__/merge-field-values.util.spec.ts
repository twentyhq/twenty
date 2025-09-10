import { FieldMetadataType } from 'twenty-shared/types';

import { mergeFieldValues } from 'src/engine/api/graphql/graphql-query-runner/utils/merge-field-values.util';

describe('mergeFieldValues', () => {
  const PRIORITY_RECORD_ID = 'priority-record-id';
  const RECORDS_WITH_VALUES = [
    { value: 'value1', recordId: 'record1' },
    { value: 'value2', recordId: PRIORITY_RECORD_ID },
    { value: 'value3', recordId: 'record3' },
  ];

  describe('default field types', () => {
    it('should return priority field value for text fields', () => {
      const result = mergeFieldValues(
        FieldMetadataType.TEXT,
        RECORDS_WITH_VALUES,
        PRIORITY_RECORD_ID,
      );

      expect(result).toBe('value2');
    });

    it('should throw error when priority record is not found', () => {
      const recordsWithoutPriorityValue = [
        { value: 'value1', recordId: 'record1' },
        { value: null, recordId: PRIORITY_RECORD_ID },
        { value: 'value3', recordId: 'record3' },
      ];

      expect(() =>
        mergeFieldValues(
          FieldMetadataType.TEXT,
          recordsWithoutPriorityValue,
          'non-existent-id',
        ),
      ).toThrow('Priority record with ID non-existent-id not found');
    });
  });

  describe('array field types', () => {
    it('should merge array values', () => {
      const arrayRecords = [
        { value: ['a', 'b'], recordId: 'record1' },
        { value: ['b', 'c'], recordId: PRIORITY_RECORD_ID },
        { value: ['c', 'd'], recordId: 'record3' },
      ];

      const result = mergeFieldValues(
        FieldMetadataType.ARRAY,
        arrayRecords,
        PRIORITY_RECORD_ID,
      );

      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('arrayable field types', () => {
    it('should merge emails for EMAILS field', () => {
      const emailRecords = [
        {
          value: {
            primaryEmail: 'first@example.com',
            additionalEmails: ['extra1@example.com'],
          },
          recordId: 'record1',
        },
        {
          value: {
            primaryEmail: 'priority@example.com',
            additionalEmails: ['extra2@example.com'],
          },
          recordId: PRIORITY_RECORD_ID,
        },
      ];

      const result = mergeFieldValues(
        FieldMetadataType.EMAILS,
        emailRecords,
        PRIORITY_RECORD_ID,
      );

      expect(result).toEqual({
        primaryEmail: 'priority@example.com',
        additionalEmails: ['extra1@example.com', 'extra2@example.com'],
      });
    });
  });
});
