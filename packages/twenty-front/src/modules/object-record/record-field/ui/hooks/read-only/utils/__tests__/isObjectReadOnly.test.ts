import { isObjectReadOnly } from '@/object-record/record-field/ui/hooks/read-only/utils/isObjectReadOnly';

describe('isObjectReadOnly', () => {
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

  it('should return false if object is not read only', () => {
    const result = isObjectReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: mockObjectMetadataItem,
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
      objectMetadataItem: mockObjectMetadataItem,
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
      objectMetadataItem: {
        ...mockObjectMetadataItem,
        isUIReadOnly: true,
      },
    });

    expect(result).toBe(true);
  });
});
