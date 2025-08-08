import { isObjectReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isObjectReadOnly';

describe('isObjectReadOnly', () => {
  it('should return true if object is not read only', () => {
    const result = isObjectReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
      },
    });

    expect(result).toBe(false);
  });

  it('should return false if object is read only', () => {
    const result = isObjectReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
      },
    });

    expect(result).toBe(true);
  });
});
