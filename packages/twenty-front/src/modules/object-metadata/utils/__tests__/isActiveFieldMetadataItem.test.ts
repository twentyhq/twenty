import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

describe('isActiveFieldMetadataItem', () => {
  it('should return false for inactive fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: {
        isActive: false,
        isSystem: false,
        name: 'fieldName',
        type: FieldMetadataType.TEXT,
      },
    });
    expect(res).toBe(false);
  });

  it('should return true for active fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: {
        isActive: true,
        isSystem: false,
        name: 'fieldName',
        type: FieldMetadataType.TEXT,
      },
    });
    expect(res).toBe(true);
  });

  it('should return false for hidden system fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: {
        isActive: true,
        isSystem: true,
        name: 'position',
        type: FieldMetadataType.POSITION,
      },
    });
    expect(res).toBe(false);
  });

  it('should return false for non hidden system fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: {
        isActive: true,
        isSystem: true,
        name: 'fieldName',
        type: FieldMetadataType.TEXT,
      },
    });
    expect(res).toBe(true);
  });

  it('should return true for junction relations, whatever object they belong to', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: {
        isActive: true,
        isSystem: true,
        name: 'position',
        type: FieldMetadataType.RELATION,
        settings: { junctionTargetFieldId: 'junction-target-field-id' },
      },
    });
    expect(res).toBe(true);
  });
});
