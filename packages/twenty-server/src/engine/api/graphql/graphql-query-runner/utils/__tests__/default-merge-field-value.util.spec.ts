import { defaultMergeFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/default-merge-field-value.util';

describe('defaultMergeFieldValue', () => {
  it('should return priority record value when available', () => {
    const recordsWithValues = [
      {
        recordId: '1',
        value: 'priority value',
      },
      {
        recordId: '2',
        value: 'other value',
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toBe('priority value');
  });

  it('should fall back to first record with value when priority record not found', () => {
    const recordsWithValues = [
      {
        recordId: '2',
        value: 'first value',
      },
      {
        recordId: '3',
        value: 'second value',
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toBe('first value');
  });

  it('should fall back to other record when priority record has null value', () => {
    const recordsWithValues = [
      {
        recordId: '1',
        value: null,
      },
      {
        recordId: '2',
        value: 'fallback value',
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toBe('fallback value');
  });

  it('should fall back to other record when priority record has empty string', () => {
    const recordsWithValues = [
      {
        recordId: '1',
        value: '',
      },
      {
        recordId: '2',
        value: 'fallback value',
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toBe('fallback value');
  });

  it('should fall back to other record when priority record has undefined value', () => {
    const recordsWithValues = [
      {
        recordId: '1',
        value: undefined,
      },
      {
        recordId: '2',
        value: 'fallback value',
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toBe('fallback value');
  });

  it('should return null when no records exist', () => {
    const result = defaultMergeFieldValue([], '1');

    expect(result).toBeNull();
  });

  it('should return null when no record has a value', () => {
    const recordsWithValues = [
      {
        recordId: '1',
        value: null,
      },
      {
        recordId: '2',
        value: '',
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toBeNull();
  });

  it('should handle complex object values', () => {
    const recordsWithValues = [
      {
        recordId: '1',
        value: { name: 'priority object', id: 1 },
      },
      {
        recordId: '2',
        value: { name: 'fallback object', id: 2 },
      },
    ];

    const result = defaultMergeFieldValue(recordsWithValues, '1');

    expect(result).toEqual({ name: 'priority object', id: 1 });
  });
});
