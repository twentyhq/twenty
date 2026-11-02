import { isObjectReadOnly } from '@/object-record/read-only/utils/isObjectReadOnly';

const editableObjectMetadataItem = {
  isUIEditable: true,
  isRemote: false,
};

describe('isObjectReadOnly', () => {
  it('should return false for an editable object the user can update', () => {
    expect(
      isObjectReadOnly({
        isLayoutCustomizationModeEnabled: false,
        objectPermissions: { canUpdateObjectRecords: true },
        objectMetadataItem: editableObjectMetadataItem,
      }),
    ).toBe(false);
  });

  it('should return true while the layout is being customized', () => {
    expect(
      isObjectReadOnly({
        isLayoutCustomizationModeEnabled: true,
        objectPermissions: { canUpdateObjectRecords: true },
        objectMetadataItem: editableObjectMetadataItem,
      }),
    ).toBe(true);
  });

  it('should return true when the user cannot update the object records', () => {
    expect(
      isObjectReadOnly({
        isLayoutCustomizationModeEnabled: false,
        objectPermissions: { canUpdateObjectRecords: false },
        objectMetadataItem: editableObjectMetadataItem,
      }),
    ).toBe(true);
  });
});
