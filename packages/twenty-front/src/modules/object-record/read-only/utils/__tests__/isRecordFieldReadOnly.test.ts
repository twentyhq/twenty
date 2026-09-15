import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { MetadataWritability } from '~/generated-metadata/graphql';

describe('isRecordFieldReadOnly', () => {
  const mockObjectPermissions = {
    canUpdateObjectRecords: true,
    objectMetadataId: '123',
    restrictedFields: {},
  };

  const mockParams = {
    isRecordReadOnly: false,
    objectPermissions: mockObjectPermissions,
    fieldMetadataItem: {
      id: 'field-123',
      isUIEditable: true,
      writability: MetadataWritability.OPEN,
    },
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
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        isUIEditable: false,
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when all conditions allow editing', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
    });

    expect(result).toBe(false);
  });

  it('should return true when the field writability is SYSTEM', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        writability: MetadataWritability.SYSTEM,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true when the field writability is APPLICATION', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        writability: MetadataWritability.APPLICATION,
      },
    });

    expect(result).toBe(true);
  });

  it('should treat a missing field writability as OPEN', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        writability: undefined,
      },
    });

    expect(result).toBe(false);
  });
});
