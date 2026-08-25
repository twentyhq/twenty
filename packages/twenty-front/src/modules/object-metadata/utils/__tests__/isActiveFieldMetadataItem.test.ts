import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';

describe('isActiveFieldMetadataItem', () => {
  it('should return false for inactive fields', () => {
    const res = isActiveFieldMetadataItem({
      isActive: false,
      isSystem: false,
      name: 'fieldName',
    });
    expect(res).toBe(false);
  });

  it('should return true for active fields', () => {
    const res = isActiveFieldMetadataItem({
      isActive: true,
      isSystem: false,
      name: 'fieldName',
    });
    expect(res).toBe(true);
  });

  it('should return false for hidden system fields', () => {
    const res = isActiveFieldMetadataItem({
      isActive: true,
      isSystem: true,
      name: 'position',
    });
    expect(res).toBe(false);
  });

  it('should return true for non hidden system fields', () => {
    const res = isActiveFieldMetadataItem({
      isActive: true,
      isSystem: true,
      name: 'fieldName',
    });
    expect(res).toBe(true);
  });
});
