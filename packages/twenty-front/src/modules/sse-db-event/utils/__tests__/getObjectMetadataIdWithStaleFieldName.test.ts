import { getObjectMetadataIdWithStaleFieldName } from '@/sse-db-event/utils/getObjectMetadataIdWithStaleFieldName';

const fieldRecord = {
  id: 'field-id',
  name: 'isRecurring',
  objectMetadataId: 'person-object-id',
};

describe('getObjectMetadataIdWithStaleFieldName', () => {
  it('returns the object of a renamed field', () => {
    expect(
      getObjectMetadataIdWithStaleFieldName({
        type: 'update',
        updatedRecord: fieldRecord,
        updatedFields: ['name', 'label'],
      }),
    ).toBe('person-object-id');
  });

  it('ignores updates that keep the field name', () => {
    expect(
      getObjectMetadataIdWithStaleFieldName({
        type: 'update',
        updatedRecord: fieldRecord,
        updatedFields: ['label'],
      }),
    ).toBeUndefined();
  });

  it('returns the object of a deleted field', () => {
    expect(
      getObjectMetadataIdWithStaleFieldName({
        type: 'delete',
        deletedRecordId: 'field-id',
        deletedRecord: fieldRecord,
      }),
    ).toBe('person-object-id');
  });

  it('ignores deletes that carry no previous record', () => {
    expect(
      getObjectMetadataIdWithStaleFieldName({
        type: 'delete',
        deletedRecordId: 'field-id',
      }),
    ).toBeUndefined();
  });

  it('ignores created fields', () => {
    expect(
      getObjectMetadataIdWithStaleFieldName({
        type: 'create',
        createdRecord: fieldRecord,
      }),
    ).toBeUndefined();
  });
});
