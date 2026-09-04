import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

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
      type: FieldMetadataType.TEXT,
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

  it('should return true when field is from the standard application on a system object', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isSystemObject: true,
      isFieldFromStandardApplication: true,
    });

    expect(result).toBe(true);
  });

  it('should return false when field is not from the standard application on a system object', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isSystemObject: true,
      isFieldFromStandardApplication: false,
    });

    expect(result).toBe(false);
  });

  it('should return true when field application is not resolved on a system object', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isSystemObject: true,
    });

    expect(result).toBe(true);
  });

  it('should return false for a junction target field on a system object', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isSystemObject: true,
      isFieldFromStandardApplication: true,
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        type: FieldMetadataType.RELATION,
        settings: { junctionTargetFieldId: 'target-field-123' },
      },
    });

    expect(result).toBe(false);
  });

  it('should return true for a plain relation field on a system object', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isSystemObject: true,
      isFieldFromStandardApplication: true,
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.ONE_TO_MANY },
      },
    });

    expect(result).toBe(true);
  });

  it('should keep a junction target field read-only when the record is read-only', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      isRecordReadOnly: true,
      isSystemObject: true,
      fieldMetadataItem: {
        ...mockParams.fieldMetadataItem,
        type: FieldMetadataType.RELATION,
        settings: { junctionTargetFieldId: 'target-field-123' },
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when isSystemObject is not provided', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
    });

    expect(result).toBe(false);
  });
});
