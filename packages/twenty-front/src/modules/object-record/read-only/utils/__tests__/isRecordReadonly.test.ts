import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';

describe('isRecordReadOnly', () => {
  it('should return false if record is not deleted, has update permissions and object metadata is not read only', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
      },
      isRecordDeleted: false,
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return true if record is not deleted but lacks update permissions and object metadata is not read only', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
      },
      isRecordDeleted: false,
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if record is deleted even with update permissions and object metadata is not read only', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
      },
      isRecordDeleted: true,
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if record is not deleted and has update permissions but object metadata is UI read only', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
      },
      isRecordDeleted: true,
      objectMetadataItem: {
        isUIReadOnly: true,
        isRemote: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if record is not deleted and has update permissions but object metadata is remote', () => {
    const result = isRecordReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
      },
      isRecordDeleted: false,
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: true,
      },
    });

    expect(result).toBe(true);
  });
});
