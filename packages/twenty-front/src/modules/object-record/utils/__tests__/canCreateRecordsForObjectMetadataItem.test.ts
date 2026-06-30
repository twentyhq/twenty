import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';

const creatableObjectMetadataItem = {
  isUICreatable: true,
  isUIEditable: true,
  isSystem: false,
  isRemote: false,
  applicationId: 'applicationId',
};

const objectPermissionsAllowingUpdate = {
  canUpdateObjectRecords: true,
  objectMetadataId: '123',
  restrictedFields: {},
};

describe('canCreateRecordsForObjectMetadataItem', () => {
  it('should return true for a creatable, editable, non-system, non-remote object with update permission', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingUpdate,
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(true);
  });

  it('should return false when the object is not UI creatable', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingUpdate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isUICreatable: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return false when the object is not UI editable', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingUpdate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isUIEditable: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return true for a UI-creatable system object (isSystem only controls Data-Model visibility)', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingUpdate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isSystem: true,
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when the object is remote', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingUpdate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isRemote: true,
      },
    });

    expect(result).toBe(false);
  });

  it('should return false when the user lacks the update permission proxy', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: {
        ...objectPermissionsAllowingUpdate,
        canUpdateObjectRecords: false,
      },
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(false);
  });

  it('should not require object permissions to be provided', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(true);
  });
});
