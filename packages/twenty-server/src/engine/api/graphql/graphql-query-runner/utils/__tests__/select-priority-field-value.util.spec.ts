import { selectPriorityFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/select-priority-field-value.util';

describe('selectPriorityFieldValue', () => {
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

    const result = selectPriorityFieldValue(recordsWithValues, '1');

    expect(result).toBe('priority value');
  });

  it('should return first record value when priority record not found', () => {
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

    const result = selectPriorityFieldValue(recordsWithValues, '1');

    expect(result).toBe('first value');
  });

  it('should return first record value when priority record has no value', () => {
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

    const result = selectPriorityFieldValue(recordsWithValues, '1');

    expect(result).toBe('fallback value');
  });

  it('should return first record value when priority record has empty string', () => {
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

    const result = selectPriorityFieldValue(recordsWithValues, '1');

    expect(result).toBe('fallback value');
  });

  it('should handle undefined values', () => {
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

    const result = selectPriorityFieldValue(recordsWithValues, '1');

    expect(result).toBe('fallback value');
  });

  it('should return null when no records exist', () => {
    const result = selectPriorityFieldValue([], '1');

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

    const result = selectPriorityFieldValue(recordsWithValues, '1');

    expect(result).toEqual({ name: 'priority object', id: 1 });
  });
});
