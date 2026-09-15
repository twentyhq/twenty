import { getDeletedRecordIdsFromOperation } from '@/object-core/utils/getDeletedRecordIdsFromOperation';

describe('getDeletedRecordIdsFromOperation', () => {
  it('should read the ids of a bulk deletion', () => {
    expect(
      getDeletedRecordIdsFromOperation({
        type: 'delete-many',
        deletedRecordIds: ['workspace-1', 'workspace-2'],
      }),
    ).toEqual(['workspace-1', 'workspace-2']);
  });

  it('should read the id of a single deletion', () => {
    expect(
      getDeletedRecordIdsFromOperation({
        type: 'delete-one',
        deletedRecordId: 'workspace-1',
      }),
    ).toEqual(['workspace-1']);
  });

  it('should return nothing for an operation that carries no deleted ids', () => {
    expect(getDeletedRecordIdsFromOperation({ type: 'destroy-one' })).toEqual(
      [],
    );
  });
});
