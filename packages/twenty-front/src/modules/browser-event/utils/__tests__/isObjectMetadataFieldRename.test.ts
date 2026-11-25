import { isObjectMetadataFieldRename } from '@/browser-event/utils/isObjectMetadataFieldRename';

const fieldRecord = {
  id: 'field-id',
  name: 'isRecurring',
  objectMetadataId: 'person-object-id',
};

describe('isObjectMetadataFieldRename', () => {
  it('is true for an update that changes the field name', () => {
    expect(
      isObjectMetadataFieldRename({
        type: 'update',
        updatedRecord: fieldRecord,
        updatedFields: ['name', 'label'],
      }),
    ).toBe(true);
  });

  it('is false for an update that keeps the field name', () => {
    expect(
      isObjectMetadataFieldRename({
        type: 'update',
        updatedRecord: fieldRecord,
        updatedFields: ['label'],
      }),
    ).toBe(false);
  });

  it('is false for an update without updated fields', () => {
    expect(
      isObjectMetadataFieldRename({
        type: 'update',
        updatedRecord: fieldRecord,
      }),
    ).toBe(false);
  });

  it('is false for other operations', () => {
    expect(
      isObjectMetadataFieldRename({
        type: 'delete',
        deletedRecordId: 'field-id',
        deletedRecord: fieldRecord,
      }),
    ).toBe(false);
    expect(
      isObjectMetadataFieldRename({
        type: 'create',
        createdRecord: fieldRecord,
      }),
    ).toBe(false);
  });
});
