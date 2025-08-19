import { isObjectReadOnly } from '@/object-record/read-only/utils/isObjectReadOnly';

describe('isObjectReadOnly', () => {
  it('should return false if object is not read only', () => {
    const result = isObjectReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      isUIReadOnly: false,
    });

    expect(result).toBe(false);
  });

  it('should return true if object cannot be updated', () => {
    const result = isObjectReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      isUIReadOnly: false,
    });

    expect(result).toBe(true);
  });

  it('should return true if object metadata is UI read only', () => {
    const result = isObjectReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      isUIReadOnly: true,
    });

    expect(result).toBe(true);
  });
});
