import { type ObjectRecord } from 'twenty-shared/types';

import { computeDuplicateKeys } from 'src/engine/api/common/common-query-runners/utils/compute-duplicate-keys.util';

describe('computeDuplicateKeys', () => {
  const record: ObjectRecord = {
    id: 'recordId',
    messageThreadId: 'thread-1',
    role: 'FROM',
    externalId: null,
  };

  it('should return no key when the related object has no duplicate key column group', () => {
    expect(
      computeDuplicateKeys({ record, duplicateKeyColumnGroups: [] }),
    ).toEqual([]);
  });

  it('should return one key per duplicate key column group', () => {
    expect(
      computeDuplicateKeys({
        record,
        duplicateKeyColumnGroups: [['messageThreadId'], ['role']],
      }),
    ).toHaveLength(2);
  });

  it('should give the same key to two records sharing every column of a group', () => {
    const duplicateKeyColumnGroups = [['messageThreadId', 'role']];
    const otherRecord: ObjectRecord = {
      id: 'otherRecordId',
      messageThreadId: 'thread-1',
      role: 'FROM',
    };

    expect(computeDuplicateKeys({ record, duplicateKeyColumnGroups })).toEqual(
      computeDuplicateKeys({
        record: otherRecord,
        duplicateKeyColumnGroups,
      }),
    );
  });

  it('should give different keys to groups made of different columns holding the same value', () => {
    const sameValueOnBothColumns: ObjectRecord = {
      id: 'recordId',
      firstColumn: 'value',
      secondColumn: 'value',
    };

    const [firstKey, secondKey] = computeDuplicateKeys({
      record: sameValueOnBothColumns,
      duplicateKeyColumnGroups: [['firstColumn'], ['secondColumn']],
    });

    expect(firstKey).not.toBe(secondKey);
  });

  it('should skip a group holding a null, since postgres lets those rows coexist', () => {
    expect(
      computeDuplicateKeys({
        record,
        duplicateKeyColumnGroups: [['messageThreadId'], ['externalId']],
      }),
    ).toEqual(
      computeDuplicateKeys({
        record,
        duplicateKeyColumnGroups: [['messageThreadId']],
      }),
    );
  });

  it('should return a single shared key when a group has no column, so one record may hold it', () => {
    const otherRecord: ObjectRecord = { id: 'otherRecordId' };

    expect(
      computeDuplicateKeys({ record, duplicateKeyColumnGroups: [[]] }),
    ).toEqual(
      computeDuplicateKeys({
        record: otherRecord,
        duplicateKeyColumnGroups: [[]],
      }),
    );
  });
});
