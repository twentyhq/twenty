import { FieldMetadataType } from 'twenty-shared/types';

import { mergeFieldValues } from 'src/engine/api/graphql/graphql-query-runner/utils/merge-field-values.util';

describe('mergeFieldValues', () => {
  const priorityRecordId = 'priority-record-id';
  const recordsWithValues = [
    { value: 'value1', recordId: 'record1' },
    { value: 'value2', recordId: priorityRecordId },
    { value: 'value3', recordId: 'record3' },
  ];

  describe('default field types', () => {
    it('should return priority field value for text fields', () => {
      const result = mergeFieldValues(
        FieldMetadataType.TEXT,
        false,
        recordsWithValues,
        priorityRecordId,
      );

      expect(result).toBe('value2');
    });

    it('should return fallback value when priority record has no value', () => {
      const recordsWithoutPriorityValue = [
        { value: 'value1', recordId: 'record1' },
        { value: null, recordId: priorityRecordId },
        { value: 'value3', recordId: 'record3' },
      ];

      const result = mergeFieldValues(
        FieldMetadataType.TEXT,
        false,
        recordsWithoutPriorityValue,
        priorityRecordId,
      );

      expect(result).toBe('value1');
    });
  });

  describe('array field types', () => {
    it('should merge array values', () => {
      const arrayRecords = [
        { value: ['a', 'b'], recordId: 'record1' },
        { value: ['b', 'c'], recordId: priorityRecordId },
        { value: ['c', 'd'], recordId: 'record3' },
      ];

      const result = mergeFieldValues(
        FieldMetadataType.ARRAY,
        false,
        arrayRecords,
        priorityRecordId,
      );

      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('composite field types', () => {
    it('should merge emails for composite EMAILS field', () => {
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
          recordId: priorityRecordId,
        },
      ];

      const result = mergeFieldValues(
        FieldMetadataType.EMAILS,
        true,
        emailRecords,
        priorityRecordId,
      );

      expect(result).toEqual({
        primaryEmail: 'priority@example.com',
        additionalEmails: ['extra1@example.com', 'extra2@example.com'],
      });
    });

    it('should use priority value for non-composite EMAILS field', () => {
      const result = mergeFieldValues(
        FieldMetadataType.EMAILS,
        false,
        recordsWithValues,
        priorityRecordId,
      );

      expect(result).toBe('value2');
    });
  });
});
