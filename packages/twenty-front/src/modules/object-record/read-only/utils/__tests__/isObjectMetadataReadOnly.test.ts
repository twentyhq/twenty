import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';

describe('isObjectMetadataReadOnly', () => {
  it('should return false if object can be updated and is not UI read only and is not remote', () => {
    const result = isObjectMetadataReadOnly({
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

  it('should return true if object cannot be updated and is not UI read only and is not remote', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if object metadata is UI read only', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIReadOnly: true,
        isRemote: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if object metadata is remote', () => {
    const result = isObjectMetadataReadOnly({
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

  it('should return false if object is managed by application', () => {
    const result = isObjectMetadataReadOnly({
      objectMetadataItem: {
        applicationId: 'applicationId',
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return false if object is custom', () => {
    const result = isObjectMetadataReadOnly({
      objectMetadataItem: {
        applicationId: undefined,
        isUIReadOnly: false,
        isRemote: false,
      },
    });

    expect(result).toBe(false);
  });
});
