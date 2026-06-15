import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { dedupeMorphRelationFieldMetadataItems } from '@/object-metadata/utils/dedupeMorphRelationFieldMetadataItems';

const buildField = (
  field: Partial<FieldMetadataItem> &
    Pick<FieldMetadataItem, 'id' | 'name' | 'type'>,
): FieldMetadataItem =>
  ({
    isActive: true,
    isSystem: false,
    label: field.name,
    ...field,
  }) as FieldMetadataItem;

describe('dedupeMorphRelationFieldMetadataItems', () => {
  it('should keep non-morph fields untouched', () => {
    const fields = [
      buildField({ id: '1', name: 'name', type: FieldMetadataType.TEXT }),
      buildField({ id: '2', name: 'amount', type: FieldMetadataType.NUMBER }),
    ];

    expect(dedupeMorphRelationFieldMetadataItems(fields)).toEqual(fields);
  });

  it('should keep a single field per morphId', () => {
    const fields = [
      buildField({
        id: 'b',
        name: 'morphOnCompanyPeople',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'a',
        name: 'morphOnCompanyNotes',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result).toHaveLength(1);
    // Smallest id wins the tie-break, matching the server survivor selection
    expect(result[0].id).toBe('a');
  });

  it('should preserve the position of the surviving morph field', () => {
    const fields = [
      buildField({ id: 'name', name: 'name', type: FieldMetadataType.TEXT }),
      buildField({
        id: 'a',
        name: 'morphPerson',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'z',
        name: 'morphNote',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({ id: 'tag', name: 'tag', type: FieldMetadataType.TEXT }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result.map((field) => field.id)).toEqual(['name', 'a', 'tag']);
  });

  it('should prefer active non-system fields over system ones', () => {
    const fields = [
      buildField({
        id: 'a',
        name: 'morphSystem',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
        isSystem: true,
      }),
      buildField({
        id: 'z',
        name: 'morphStandard',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
        isSystem: false,
      }),
    ];

    const result = dedupeMorphRelationFieldMetadataItems(fields);

    expect(result).toHaveLength(1);
    // Non-system field wins even though it has a larger id
    expect(result[0].id).toBe('z');
  });

  it('should dedupe each morphId independently', () => {
    const fields = [
      buildField({
        id: 'a1',
        name: 'firstMorphPerson',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'a2',
        name: 'firstMorphNote',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'morph-1',
      }),
      buildField({
        id: 'b1',
        name: 'secondMorphPerson',
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
        name: 'morphWithoutMorphId',
        type: FieldMetadataType.MORPH_RELATION,
        morphId: null,
      }),
    ];

    expect(dedupeMorphRelationFieldMetadataItems(fields)).toEqual(fields);
  });
});
