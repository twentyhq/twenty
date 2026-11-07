import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';

const creatableObjectMetadataItem = {
  isUICreatable: true,
  isUIEditable: true,
  isRemote: false,
};

const objectPermissionsAllowingCreate = getDefaultObjectPermissions();

describe('canCreateRecordsForObjectMetadataItem', () => {
  it('should return true for a creatable, editable, non-remote object with create permission', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingCreate,
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(true);
  });

  it('should return false without create permission, even with update permission', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: {
        ...objectPermissionsAllowingCreate,
        canCreateAllRecords: false,
      },
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(false);
  });

  it('should return false when the object is not UI creatable', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingCreate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isUICreatable: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return false when the object is not UI editable', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingCreate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isUIEditable: false,
      },
    });

    expect(result).toBe(false);
  });

  it('should return false when the object is remote', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: objectPermissionsAllowingCreate,
      objectMetadataItem: {
        ...creatableObjectMetadataItem,
        isRemote: true,
      },
    });

    expect(result).toBe(false);
  });

  it('should return true with create permission, even without update permission', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectPermissions: {
        ...objectPermissionsAllowingCreate,
        canUpdateAllRecords: false,
      },
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(true);
  });

  it('should not require object permissions to be provided', () => {
    const result = canCreateRecordsForObjectMetadataItem({
      objectMetadataItem: creatableObjectMetadataItem,
    });

    expect(result).toBe(true);
  });
});
