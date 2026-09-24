import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { MetadataWritability } from '~/generated-metadata/graphql';

describe('isObjectMetadataReadOnly', () => {
  it('should return false if object can be updated and is not UI read only and is not remote', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIEditable: true,
        isRemote: false,
        writability: MetadataWritability.OPEN,
      },
    });

    expect(result).toBe(false);
  });

  it('should return true if object cannot be updated and is not UI read only and is not remote', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: false,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIEditable: true,
        isRemote: false,
        writability: MetadataWritability.OPEN,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if object metadata is UI read only', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIEditable: false,
        isRemote: false,
        writability: MetadataWritability.OPEN,
      },
    });

    expect(result).toBe(true);
  });

  it('should return true if object metadata is remote', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIEditable: true,
        isRemote: true,
        writability: MetadataWritability.OPEN,
      },
    });

    expect(result).toBe(true);
  });

  it('should return false without object permissions when the object is OPEN', () => {
    const result = isObjectMetadataReadOnly({
      objectMetadataItem: {
        isUIEditable: true,
        isRemote: false,
        writability: MetadataWritability.OPEN,
      },
    });

    expect(result).toBe(false);
  });

  it('should return true if object metadata writability is not OPEN', () => {
    const result = isObjectMetadataReadOnly({
      objectPermissions: {
        canUpdateObjectRecords: true,
        objectMetadataId: '123',
        restrictedFields: {},
      },
      objectMetadataItem: {
        isUIEditable: true,
        isRemote: false,
        writability: MetadataWritability.SYSTEM,
      },
    });

    expect(result).toBe(true);
  });
});
