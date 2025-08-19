import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
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
      fieldMetadataItem: {
        id: 'field-123',
        isUIReadOnly: false,
      },
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
      fieldMetadataItem: {
        id: 'field-123',
        isUIReadOnly: false,
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
      fieldMetadataItem: {
        id: 'field-123',
        isUIReadOnly: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true when field is marked as UI read-only', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataItem: {
        id: 'field-123',
        isUIReadOnly: true,
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when all conditions allow editing', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataItem: {
        id: 'field-123',
        isUIReadOnly: false,
      },
    });

    expect(result).toBe(false);
  });
});
