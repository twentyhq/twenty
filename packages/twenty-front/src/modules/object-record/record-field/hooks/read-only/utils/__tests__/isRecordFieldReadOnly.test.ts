import { isRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordFieldReadOnly';
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
    objectNameSingular: 'person',
    fieldName: 'firstName',
    fieldType: FieldMetadataType.TEXT,
    isCustom: false,
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

  it('should return true for system read-only fields like createdAt', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldName: 'createdAt',
      fieldType: FieldMetadataType.DATE_TIME,
    });

    expect(result).toBe(true);
  });

  it('should return true for calendar event objects (system read-only)', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      objectNameSingular: 'calendarEvent',
    });

    expect(result).toBe(true);
  });

  it('should return true for workflow non-name fields (system read-only)', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      objectNameSingular: 'workflow',
      fieldName: 'status',
      isCustom: false,
    });

    expect(result).toBe(true);
  });

  it('should return false when all conditions allow editing', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
    });

    expect(result).toBe(false);
  });
});
