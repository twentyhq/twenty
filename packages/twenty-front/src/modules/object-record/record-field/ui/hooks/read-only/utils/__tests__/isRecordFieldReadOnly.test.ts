import { isRecordFieldReadOnly } from '@/object-record/record-field/ui/hooks/read-only/utils/isRecordFieldReadOnly';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('isRecordFieldReadOnly', () => {
  const mockObjectPermissions = {
    canUpdateObjectRecords: true,
    objectMetadataId: '123',
    restrictedFields: {},
  };

  const mockParams = {
    isRecordReadOnly: false,
    objectPermissions: mockObjectPermissions,
    fieldMetadataId: 'field-123',
    fieldMetadataType: FieldMetadataType.TEXT,
    isUIReadOnly: false,
  };

  it('should return true when record is read-only', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isRecordReadOnly: true,
    });

    expect(result).toBe(true);
  });

  it('should return true when object lacks update permissions', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      objectPermissions: {
        ...mockObjectPermissions,
        canUpdateObjectRecords: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true when field is restricted by permissions', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      objectPermissions: {
        ...mockObjectPermissions,
        restrictedFields: {
          'field-123': { canUpdate: false },
        },
      },
    });

    expect(result).toBe(true);
  });

  it('should return true when field is marked as UI read-only', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isUIReadOnly: true,
    });

    expect(result).toBe(true);
  });

  it('should return false for RAW_JSON fields even when marked as UI read-only', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataType: FieldMetadataType.RAW_JSON,
      isUIReadOnly: true,
    });

    expect(result).toBe(false);
  });

  it('should return false when all conditions allow editing', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
    });

    expect(result).toBe(false);
  });
});
