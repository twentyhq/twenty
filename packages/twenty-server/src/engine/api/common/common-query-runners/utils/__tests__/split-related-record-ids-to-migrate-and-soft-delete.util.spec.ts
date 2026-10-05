import { type ObjectRecord } from 'twenty-shared/types';

import { splitRelatedRecordIdsToMigrateAndSoftDelete } from 'src/engine/api/common/common-query-runners/utils/split-related-record-ids-to-migrate-and-soft-delete.util';

describe('splitRelatedRecordIdsToMigrateAndSoftDelete', () => {
  const buildRelatedRecord = (
    id: string,
    columns: Record<string, string | null> = {},
  ): ObjectRecord => ({ id, ...columns });

  it('should migrate every record when the related object has no conflicting column group', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('first'),
        buildRelatedRecord('second'),
      ],
      relatedRecordsOfPriorityRecord: [buildRelatedRecord('third')],
      duplicateKeyColumnGroups: [],
    });

    expect(result).toEqual({
      idsToMigrate: ['first', 'second'],
      idsToSoftDelete: [],
    });
  });

  it('should soft delete a record the priority record already holds an equivalent of', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('shared', { messageThreadId: 'thread-1' }),
        buildRelatedRecord('exclusive', { messageThreadId: 'thread-2' }),
      ],
      relatedRecordsOfPriorityRecord: [
        buildRelatedRecord('priority', { messageThreadId: 'thread-1' }),
      ],
      duplicateKeyColumnGroups: [['messageThreadId']],
    });

    expect(result).toEqual({
      idsToMigrate: ['exclusive'],
      idsToSoftDelete: ['shared'],
    });
  });

  it('should keep a single record when several records to migrate collide with each other', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('first', { messageThreadId: 'thread-1' }),
        buildRelatedRecord('second', { messageThreadId: 'thread-1' }),
        buildRelatedRecord('third', { messageThreadId: 'thread-1' }),
      ],
      relatedRecordsOfPriorityRecord: [],
      duplicateKeyColumnGroups: [['messageThreadId']],
    });

    expect(result).toEqual({
      idsToMigrate: ['first'],
      idsToSoftDelete: ['second', 'third'],
    });
  });

  it('should migrate records whose conflicting column is null, since postgres lets those coexist', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('first', { messageThreadId: null }),
        buildRelatedRecord('second', { messageThreadId: null }),
      ],
      relatedRecordsOfPriorityRecord: [
        buildRelatedRecord('priority', { messageThreadId: null }),
      ],
      duplicateKeyColumnGroups: [['messageThreadId']],
    });

    expect(result).toEqual({
      idsToMigrate: ['first', 'second'],
      idsToSoftDelete: [],
    });
  });

  it('should only collide when every column of a group matches', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('same-pair', { threadId: 'a', role: 'FROM' }),
        buildRelatedRecord('same-thread-other-role', {
          threadId: 'a',
          role: 'TO',
        }),
      ],
      relatedRecordsOfPriorityRecord: [
        buildRelatedRecord('priority', { threadId: 'a', role: 'FROM' }),
      ],
      duplicateKeyColumnGroups: [['threadId', 'role']],
    });

    expect(result).toEqual({
      idsToMigrate: ['same-thread-other-role'],
      idsToSoftDelete: ['same-pair'],
    });
  });

  it('should keep at most one record when the join column alone must stay unique', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('first'),
        buildRelatedRecord('second'),
      ],
      relatedRecordsOfPriorityRecord: [buildRelatedRecord('priority')],
      duplicateKeyColumnGroups: [[]],
    });

    expect(result).toEqual({
      idsToMigrate: [],
      idsToSoftDelete: ['first', 'second'],
    });
  });

  it('should soft delete a record colliding on any one of several conflicting column groups', () => {
    const result = splitRelatedRecordIdsToMigrateAndSoftDelete({
      relatedRecordsOfRecordsToDelete: [
        buildRelatedRecord('collides-on-second-group', {
          threadId: 'b',
          externalId: 'x',
        }),
      ],
      relatedRecordsOfPriorityRecord: [
        buildRelatedRecord('priority', { threadId: 'a', externalId: 'x' }),
      ],
      duplicateKeyColumnGroups: [['threadId'], ['externalId']],
    });

    expect(result).toEqual({
      idsToMigrate: [],
      idsToSoftDelete: ['collides-on-second-group'],
    });
  });
});
