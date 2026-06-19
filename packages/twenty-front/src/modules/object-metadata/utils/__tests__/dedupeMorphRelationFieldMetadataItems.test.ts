import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { dedupeMorphRelationFieldMetadataItems } from '@/object-metadata/utils/dedupeMorphRelationFieldMetadataItems';

const buildField = (
  field: Partial<FieldMetadataItem> & Pick<FieldMetadataItem, 'id' | 'type'>,
): FieldMetadataItem =>
  ({
    isActive: true,
    isSystem: false,
    morphId: null,
    ...field,
  }) as FieldMetadataItem;

describe('dedupeMorphRelationFieldMetadataItems', () => {
  it('should keep non-morph fields untouched', () => {
    const fields = [
      buildField({ id: '1', type: FieldMetadataType.TEXT }),
      buildField({ id: '2', type: FieldMetadataType.NUMBER }),
    ];

    expect(dedupeMorphRelationFieldMetadataItems(fields)).toEqual(fields);
  });

  it('should keep a single field per morphId', () => {
    const fields = [
      buildField({
        id: 'b',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'a',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('should preserve the position of the surviving morph field', () => {
    const fields = [
      buildField({ id: 'name', type: FieldMetadataType.TEXT }),
      buildField({
        id: 'a',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'z',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({ id: 'tag', type: FieldMetadataType.TEXT }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result.map((field) => field.id)).toEqual(['name', 'a', 'tag']);
  });

  it('should prefer active non-system fields over system ones', () => {
    const fields = [
      buildField({
        id: 'a',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
        isSystem: true,
      }),
      buildField({
        id: 'z',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
        isSystem: false,
      }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('z');
  });

  it('should keep the active morph field over an inactive one', () => {
    const fields = [
      buildField({
        id: 'a',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
        isActive: false,
      }),
      buildField({
        id: 'z',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
        isActive: true,
      }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('z');
  });

  it('should dedupe each morphId independently', () => {
    const fields = [
      buildField({
        id: 'a1',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'a2',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'b1',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-2',
      }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result.map((field) => field.id).sort()).toEqual(['a1', 'b1']);
  });

  it('should keep morph fields without a morphId', () => {
    const fields = [
      buildField({
        id: 'a',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: null,
      }),
    ];

    expect(dedupeMorphRelationFieldMetadataItems(fields)).toEqual(fields);
  });
});
