import { isObjectMetadataSettingsReadOnly } from '@/object-record/read-only/utils/isObjectMetadataSettingsReadOnly';

describe('isObjectMetadataSettingsReadOnly', () => {
  it('should return false if object can be updated and is not UI read only and is not remote', () => {
    const result = isObjectMetadataSettingsReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return true if object is remote', () => {
    const result = isObjectMetadataSettingsReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: true,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if object is UI read only', () => {
    const result = isObjectMetadataSettingsReadOnly({
      objectMetadataItem: {
        isUIReadOnly: true,
        isRemote: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return false for standard/third-party objects (they are editable via standardOverrides)', () => {
    const result = isObjectMetadataSettingsReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(false);
  });
});
