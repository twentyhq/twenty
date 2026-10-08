import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { getMorphFieldMetadataItemsToUpsertOnFieldDeletion } from '@/metadata-store/utils/getMorphFieldMetadataItemsToUpsertOnFieldDeletion';
import { FieldMetadataType } from 'twenty-shared/types';

const buildMorphRelation = (rowId: string, targetObjectMetadataId: string) =>
  ({
    sourceFieldMetadata: { id: rowId, name: 'target' },
    targetObjectMetadata: {
      id: targetObjectMetadataId,
      nameSingular: targetObjectMetadataId,
      namePlural: `${targetObjectMetadataId}s`,
    },
  }) as unknown as NonNullable<FlatFieldMetadataItem['morphRelations']>[number];

const COMPANY_ROW = buildMorphRelation('row-company', 'company');
const PERSON_ROW = buildMorphRelation('row-person', 'person');
const CUSTOM_ROW = buildMorphRelation('row-custom', 'custom');

const buildField = (
  field: Partial<FlatFieldMetadataItem> & Pick<FlatFieldMetadataItem, 'id'>,
): FlatFieldMetadataItem =>
  ({
    name: field.id,
    type: FieldMetadataType.MORPH_RELATION,
    objectMetadataId: 'note-target',
    morphId: 'target-morph',
    isActive: true,
    isSystem: false,
    ...field,
  }) as FlatFieldMetadataItem;

describe('getMorphFieldMetadataItemsToUpsertOnFieldDeletion', () => {
  it('should hand the morph group over to the remaining sibling with the lowest id when its representative row is deleted', () => {
    const representative = buildField({
      id: 'row-custom',
      name: 'target',
      morphRelations: [PERSON_ROW, CUSTOM_ROW, COMPANY_ROW],
    });

    expect(
      getMorphFieldMetadataItemsToUpsertOnFieldDeletion(
        [
          representative,
          buildField({
            id: 'title',
            type: FieldMetadataType.TEXT,
            morphId: null,
          }),
        ],
        'row-custom',
      ),
    ).toEqual([
      {
        ...representative,
        id: 'row-company',
        morphRelations: [PERSON_ROW, COMPANY_ROW],
      },
    ]);
  });

  it('should only drop the deleted row from the representative when another row is deleted', () => {
    const representative = buildField({
      id: 'row-company',
      morphRelations: [COMPANY_ROW, PERSON_ROW, CUSTOM_ROW],
    });

    expect(
      getMorphFieldMetadataItemsToUpsertOnFieldDeletion(
        [representative],
        'row-custom',
      ),
    ).toEqual([
      { ...representative, morphRelations: [COMPANY_ROW, PERSON_ROW] },
    ]);
  });

  it('should not promote a sibling when another row of the morph group is still in the store', () => {
    const representative = buildField({
      id: 'row-custom',
      morphRelations: [COMPANY_ROW, CUSTOM_ROW],
    });
    const rowAddedAfterLoad = buildField({
      id: 'row-person',
      morphRelations: [COMPANY_ROW, PERSON_ROW, CUSTOM_ROW],
    });

    expect(
      getMorphFieldMetadataItemsToUpsertOnFieldDeletion(
        [representative, rowAddedAfterLoad],
        'row-custom',
      ),
    ).toEqual([
      { ...rowAddedAfterLoad, morphRelations: [COMPANY_ROW, PERSON_ROW] },
    ]);
  });

  it('should drop the morph field when its last row is deleted', () => {
    expect(
      getMorphFieldMetadataItemsToUpsertOnFieldDeletion(
        [buildField({ id: 'row-custom', morphRelations: [CUSTOM_ROW] })],
        'row-custom',
      ),
    ).toEqual([]);
  });

  it('should return nothing when a non morph field is deleted', () => {
    expect(
      getMorphFieldMetadataItemsToUpsertOnFieldDeletion(
        [
          buildField({
            id: 'title',
            type: FieldMetadataType.TEXT,
            morphId: null,
          }),
          buildField({ id: 'row-company', morphRelations: [COMPANY_ROW] }),
        ],
        'title',
      ),
    ).toEqual([]);
  });
});
