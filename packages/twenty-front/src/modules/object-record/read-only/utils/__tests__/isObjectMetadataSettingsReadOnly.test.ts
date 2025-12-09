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
      workspaceCustomApplicationId: 'workspaceApplicationId',
    });

    expect(result).toBe(false);
  });

  it('should return true if object is managed by application', () => {
    const result = isObjectMetadataSettingsReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        applicationId: 'applicationId',
        isUIReadOnly: false,
        isRemote: false,
      },
      workspaceCustomApplicationId: null,
    });

    expect(result).toBe(true);
  });

  it('should return false if object is owned by workspace custom application', () => {
    const result = isObjectMetadataSettingsReadOnly({
      objectMetadataItem: {
        isUIReadOnly: false,
        isRemote: false,
        applicationId: 'workspaceApplicationId',
      },
      workspaceCustomApplicationId: 'workspaceApplicationId',
    });

    expect(result).toBe(false);
  });
});
