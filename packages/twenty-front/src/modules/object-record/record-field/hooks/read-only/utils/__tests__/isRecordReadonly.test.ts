import { isRecordReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordReadOnly';

describe('isRecordReadOnly', () => {
  it('should return false if record is not deleted and has update permissions', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
      },
      isRecordDeleted: false,
    });

    expect(result).toBe(false);
  });

  it('should return true if record is not deleted but lacks update permissions', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
      },
      isRecordDeleted: false,
    });

    expect(result).toBe(true);
  });

  it('should return true if record is deleted even with update permissions', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
      },
      isRecordDeleted: true,
    });

    expect(result).toBe(true);
  });

  it('should return true if record is deleted and lacks update permissions', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
      },
      isRecordDeleted: true,
    });

    expect(result).toBe(true);
  });
});
