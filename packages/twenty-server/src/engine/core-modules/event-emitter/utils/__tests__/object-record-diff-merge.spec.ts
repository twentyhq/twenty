import {
  normalizeValueForComparison,
  objectRecordDiffMerge,
} from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';

describe('objectRecordDiffMerge', () => {
  it('should merge diff properties from oldRecord and newRecord', () => {
    const oldRecord = {
      diff: {
        name: {
          before: 'Old Name',
          after: 'Intermediate Name',
        },
      },
    };

    const newRecord = {
      diff: {
        name: {
          before: 'Intermediate Name',
          after: 'New Name',
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        name: {
          before: 'Old Name',
          after: 'New Name',
        },
      },
    });
  });

  it('should skip keys where before and after values are effectively equal', () => {
    const oldRecord = {
      diff: {
        name: {
          before: 'Original Name',
          after: 'Updated Name',
        },
        status: {
          before: 'active',
          after: 'hyper-active',
        },
      },
    };

    const newRecord = {
      diff: {
        name: {
          before: 'Updated Name',
          after: 'Final Name',
        },
        status: {
          before: 'hyper-active',
          after: 'active',
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        name: {
          before: 'Original Name',
          after: 'Final Name',
        },
      },
    });
  });

  it('should keep keys that exist only in oldRecord', () => {
    const oldRecord = {
      diff: {
        name: {
          before: 'Old Name',
          after: 'Updated Name',
        },
        status: {
          before: 'inactive',
          after: 'active',
        },
      },
    };

    const newRecord = {
      diff: {
        name: {
          before: 'Updated Name',
          after: 'New Name',
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        name: {
          before: 'Old Name',
          after: 'New Name',
        },
        status: {
          before: 'inactive',
          after: 'active',
        },
      },
    });
  });

  it('should add keys that exist only in newRecord', () => {
    const oldRecord = {
      diff: {
        name: {
          before: 'Old Name',
          after: 'Updated Name',
        },
      },
    };

    const newRecord = {
      diff: {
        name: {
          before: 'Updated Name',
          after: 'New Name',
        },
        status: {
          before: 'inactive',
          after: 'active',
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        name: {
          before: 'Old Name',
          after: 'New Name',
        },
        status: {
          before: 'inactive',
          after: 'active',
        },
      },
    });
  });

  it('should handle nested objects correctly', () => {
    const oldRecord = {
      diff: {
        config: {
          before: { theme: 'light', notifications: true },
          after: { theme: 'dark', notifications: true },
        },
      },
    };

    const newRecord = {
      diff: {
        config: {
          before: { theme: 'dark', notifications: true },
          after: { theme: 'dark', notifications: false },
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        config: {
          before: { theme: 'light', notifications: true },
          after: { theme: 'dark', notifications: false },
        },
      },
    });
  });

  it('should handle arrays correctly', () => {
    const oldRecord = {
      diff: {
        tags: {
          before: ['tag1', 'tag2'],
          after: ['tag1', 'tag3'],
        },
      },
    };

    const newRecord = {
      diff: {
        tags: {
          before: ['tag1', 'tag3'],
          after: ['tag3', 'tag4'],
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        tags: {
          before: ['tag1', 'tag2'],
          after: ['tag3', 'tag4'],
        },
      },
    });
  });

  it('should treat null, empty strings, empty arrays, and empty objects as effectively equal', () => {
    const oldRecord = {
      diff: {
        field1: {
          before: null,
          after: ['xyz'],
        },
        field3: {
          before: 'value',
          after: null,
        },
      },
    };

    const newRecord = {
      diff: {
        field1: {
          before: ['xyz'],
          after: [],
        },
        field3: {
          before: null,
          after: 'new value',
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        field3: {
          before: 'value',
          after: 'new value',
        },
      },
    });
  });

  it('should handle empty diff objects', () => {
    const oldRecord = {
      diff: {},
    };

    const newRecord = {
      diff: {},
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {},
    });
  });

  it('should handle undefined diff properties', () => {
    const oldRecord = {};
    const newRecord = {};

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {},
    });
  });

  it('should handle a mix of scenarios', () => {
    const oldRecord = {
      diff: {
        name: {
          before: 'Old Name',
          after: 'Updated Name',
        },
        status: {
          before: 'inactive',
          after: 'active',
        },
        description: {
          before: 'Old description',
          after: 'Old description',
        },
      },
    };

    const newRecord = {
      diff: {
        name: {
          before: 'Updated Name',
          after: 'Final Name',
        },
        priority: {
          before: 'low',
          after: 'high',
        },
        description: {
          before: 'Old description',
          after: 'New description',
        },
      },
    };

    const result = objectRecordDiffMerge(oldRecord, newRecord);

    expect(result).toEqual({
      diff: {
        name: {
          before: 'Old Name',
          after: 'Final Name',
        },
        status: {
          before: 'inactive',
          after: 'active',
        },
        priority: {
          before: 'low',
          after: 'high',
        },
        description: {
          before: 'Old description',
          after: 'New description',
        },
      },
    });
  });
});

describe('normalizeValueForComparison', () => {
  it('should normalize primitive values', () => {
    expect(normalizeValueForComparison('test')).toBe('test');
  });

  it('should normalize null values', () => {
    expect(normalizeValueForComparison(null)).toBe('__empty__');
  });

  it('should normalize empty strings', () => {
    expect(normalizeValueForComparison('')).toBe('__empty__');
  });

  it('should normalize empty arrays', () => {
    expect(normalizeValueForComparison([])).toBe('__empty__');
  });

  it('should normalize empty objects', () => {
    expect(normalizeValueForComparison({})).toBe('__empty__');
  });

  it('should normalize nested objects', () => {
    const input = { a: 1, b: { c: null, d: [] } };
    const expected = { a: 1, b: { c: '__empty__', d: '__empty__' } };

    expect(normalizeValueForComparison(input)).toEqual(expected);
  });

  it('should normalize arrays with mixed values', () => {
    const input = ['test', null, '', [], {}];
    const expected = [
      'test',
      '__empty__',
      '__empty__',
      '__empty__',
      '__empty__',
    ];

    expect(normalizeValueForComparison(input)).toEqual(expected);
  });

  it('should normalize complex nested structures', () => {
    const input = {
      a: null,
      b: '',
      c: [],
      d: {},
      e: { f: [1, 2, null, ''] },
    };
    const expected = {
      a: '__empty__',
      b: '__empty__',
      c: '__empty__',
      d: '__empty__',
      e: { f: [1, 2, '__empty__', '__empty__'] },
    };

    expect(normalizeValueForComparison(input)).toEqual(expected);
  });
});
