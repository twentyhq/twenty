import { hasFieldCopyAction } from '@/object-record/record-field/ui/utils/hasFieldCopyAction';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('hasFieldCopyAction', () => {
  it.each([
    FieldMetadataType.EMAILS,
    FieldMetadataType.LINKS,
    FieldMetadataType.PHONES,
  ])('should return true for %s fields', (type) => {
    expect(hasFieldCopyAction({ type })).toBe(true);
  });

  it.each([
    FieldMetadataType.TEXT,
    FieldMetadataType.RAW_JSON,
    FieldMetadataType.RELATION,
  ])('should return false for %s fields', (type) => {
    expect(hasFieldCopyAction({ type })).toBe(false);
  });
});
