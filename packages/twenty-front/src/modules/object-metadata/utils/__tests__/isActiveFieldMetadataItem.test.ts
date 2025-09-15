import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';

describe('isActiveFieldMetadataItem', () => {
  it('should return false for inactive fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: { isActive: false, isSystem: false, name: 'fieldName' },
      objectNameSingular: 'objectNameSingular',
    });
    expect(res).toBe(false);
  });

  it('should return true for active fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: { isActive: true, isSystem: false, name: 'fieldName' },
      objectNameSingular: 'objectNameSingular',
    });
    expect(res).toBe(true);
  });

  it('should return false for system fields', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: { isActive: true, isSystem: true, name: 'fieldName' },
      objectNameSingular: 'objectNameSingular',
    });
    expect(res).toBe(false);
  });

  it('should return true for note targets', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: { isActive: true, isSystem: false, name: 'noteTargets' },
      objectNameSingular: 'note',
    });
    expect(res).toBe(true);
  });

  it('should return true for task targets', () => {
    const res = isActiveFieldMetadataItem({
      fieldMetadata: { isActive: true, isSystem: false, name: 'taskTargets' },
      objectNameSingular: 'task',
    });
    expect(res).toBe(true);
  });
});
