import { objectRecordChangedValues } from 'src/engine/integrations/event-emitter/utils/object-record-changed-values';

describe('objectRecordChangedValues', () => {
  it('detects changes in scalar values correctly', () => {
    const oldRecord = { id: 1, name: 'Original Name', updatedAt: new Date() };
    const newRecord = { id: 1, name: 'Updated Name', updatedAt: new Date() };

    const result = objectRecordChangedValues(oldRecord, newRecord);

    expect(result).toEqual({
      name: { before: 'Original Name', after: 'Updated Name' },
    });
  });
});

it('ignores changes in properties that are objects', () => {
  const oldRecord = { id: 1, details: { age: 20 } };
  const newRecord = { id: 1, details: { age: 21 } };

  const result = objectRecordChangedValues(oldRecord, newRecord);

  expect(result).toEqual({});
});

it('ignores changes to the updatedAt field', () => {
  const oldRecord = { id: 1, updatedAt: new Date('2020-01-01') };
  const newRecord = { id: 1, updatedAt: new Date('2024-01-01') };

  const result = objectRecordChangedValues(oldRecord, newRecord);

  expect(result).toEqual({});
});

it('returns an empty object when there are no changes', () => {
  const oldRecord = { id: 1, name: 'Name', value: 100 };
  const newRecord = { id: 1, name: 'Name', value: 100 };

  const result = objectRecordChangedValues(oldRecord, newRecord);

  expect(result).toEqual({});
});

it('correctly handles a mix of changed, unchanged, and special case values', () => {
  const oldRecord = {
    id: 1,
    name: 'Original',
    status: 'active',
    updatedAt: new Date(2020, 1, 1),
    config: { theme: 'dark' },
  };
  const newRecord = {
    id: 1,
    name: 'Updated',
    status: 'active',
    updatedAt: new Date(2021, 1, 1),
    config: { theme: 'light' },
  };
  const expectedChanges = {
    name: { before: 'Original', after: 'Updated' },
  };

  const result = objectRecordChangedValues(oldRecord, newRecord);

  expect(result).toEqual(expectedChanges);
});
