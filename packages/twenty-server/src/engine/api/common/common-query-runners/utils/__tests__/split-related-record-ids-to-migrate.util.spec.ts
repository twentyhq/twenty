import { type ObjectRecord } from 'twenty-shared/types';

import { splitRelatedRecordIdsToMigrate } from 'src/engine/api/common/common-query-runners/utils/split-related-record-ids-to-migrate.util';

describe('splitRelatedRecordIdsToMigrate', () => {
  const buildRelatedRecord = (
    id: string,
    columns: Record<string, string | null> = {},
  ): ObjectRecord => ({ id, ...columns });

  it('should migrate every record when the related object has no conflicting column group', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('first'),
        buildRelatedRecord('second'),
      ],
      priorityRelatedRecords: [buildRelatedRecord('third')],
      conflictingColumnGroups: [],
    });

    expect(result).toEqual({
      idsToMigrate: ['first', 'second'],
      idsToSoftDelete: [],
    });
  });

  it('should soft delete a record the priority record already holds an equivalent of', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('shared', { messageThreadId: 'thread-1' }),
        buildRelatedRecord('exclusive', { messageThreadId: 'thread-2' }),
      ],
      priorityRelatedRecords: [
        buildRelatedRecord('priority', { messageThreadId: 'thread-1' }),
      ],
      conflictingColumnGroups: [['messageThreadId']],
    });

    expect(result).toEqual({
      idsToMigrate: ['exclusive'],
      idsToSoftDelete: ['shared'],
    });
  });

  it('should keep a single record when several records to migrate collide with each other', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('first', { messageThreadId: 'thread-1' }),
        buildRelatedRecord('second', { messageThreadId: 'thread-1' }),
        buildRelatedRecord('third', { messageThreadId: 'thread-1' }),
      ],
      priorityRelatedRecords: [],
      conflictingColumnGroups: [['messageThreadId']],
    });

    expect(result).toEqual({
      idsToMigrate: ['first'],
      idsToSoftDelete: ['second', 'third'],
    });
  });

  it('should migrate records whose conflicting column is null, since postgres lets those coexist', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('first', { messageThreadId: null }),
        buildRelatedRecord('second', { messageThreadId: null }),
      ],
      priorityRelatedRecords: [
        buildRelatedRecord('priority', { messageThreadId: null }),
      ],
      conflictingColumnGroups: [['messageThreadId']],
    });

    expect(result).toEqual({
      idsToMigrate: ['first', 'second'],
      idsToSoftDelete: [],
    });
  });

  it('should only collide when every column of a group matches', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('same-pair', { threadId: 'a', role: 'FROM' }),
        buildRelatedRecord('same-thread-other-role', {
          threadId: 'a',
          role: 'TO',
        }),
      ],
      priorityRelatedRecords: [
        buildRelatedRecord('priority', { threadId: 'a', role: 'FROM' }),
      ],
      conflictingColumnGroups: [['threadId', 'role']],
    });

    expect(result).toEqual({
      idsToMigrate: ['same-thread-other-role'],
      idsToSoftDelete: ['same-pair'],
    });
  });

  it('should keep at most one record when the join column alone must stay unique', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('first'),
        buildRelatedRecord('second'),
      ],
      priorityRelatedRecords: [buildRelatedRecord('priority')],
      conflictingColumnGroups: [[]],
    });

    expect(result).toEqual({
      idsToMigrate: [],
      idsToSoftDelete: ['first', 'second'],
    });
  });

  it('should soft delete a record colliding on any one of several conflicting column groups', () => {
    const result = splitRelatedRecordIdsToMigrate({
      relatedRecordsToMigrate: [
        buildRelatedRecord('collides-on-second-group', {
          threadId: 'b',
          externalId: 'x',
        }),
      ],
      priorityRelatedRecords: [
        buildRelatedRecord('priority', { threadId: 'a', externalId: 'x' }),
      ],
      conflictingColumnGroups: [['threadId'], ['externalId']],
    });

    expect(result).toEqual({
      idsToMigrate: [],
      idsToSoftDelete: ['collides-on-second-group'],
    });
  });
});
