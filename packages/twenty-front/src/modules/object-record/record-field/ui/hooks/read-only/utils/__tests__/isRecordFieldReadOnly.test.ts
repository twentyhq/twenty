import { isRecordFieldReadOnly } from '@/object-record/record-field/ui/hooks/read-only/utils/isRecordFieldReadOnly';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('isRecordFieldReadOnly', () => {
  const mockObjectPermissions = {
    canUpdateObjectRecords: true,
    objectMetadataId: '123',
    restrictedFields: {},
  };

  const mockFieldMetadataItem = {
    id: 'field-123',
    name: 'firstName',
    type: FieldMetadataType.TEXT,
    isCustom: false,
    label: 'First Name',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    isActive: true,
    isNullable: true,
    isSystem: false,
    isUnique: false,
    isUIReadOnly: false,
  };

  const mockObjectMetadataItem = {
    id: '123',
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    fields: [],
    readableFields: [],
    updatableFields: [],
    labelIdentifierFieldMetadataId: 'name-field-id',
    indexMetadatas: [],
    isActive: true,
    isCustom: false,
    isSystem: false,
    isRemote: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    isLabelSyncedWithName: true,
    isSearchable: true,
    isUIReadOnly: false,
  };

  const mockParams = {
    isRecordReadOnly: false,
    objectPermissions: mockObjectPermissions,
    objectMetadataItem: mockObjectMetadataItem,
    fieldMetadataItem: mockFieldMetadataItem,
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

  it('should return true when field is system read-only (e.g., createdAt)', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      fieldMetadataItem: {
        ...mockFieldMetadataItem,
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        isUIReadOnly: true,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true for calendar event objects (system read-only)', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      objectMetadataItem: {
        ...mockObjectMetadataItem,
        nameSingular: 'calendarEvent',
      },
    });

    expect(result).toBe(true);
  });

  it('should return true for workflow non-name fields (system read-only)', () => {
    const result = isRecordFieldReadOnly({
      ...mockParams,
      objectMetadataItem: {
        ...mockObjectMetadataItem,
        nameSingular: 'workflow',
      },
      fieldMetadataItem: {
        ...mockFieldMetadataItem,
        name: 'status',
        isCustom: false,
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
});
