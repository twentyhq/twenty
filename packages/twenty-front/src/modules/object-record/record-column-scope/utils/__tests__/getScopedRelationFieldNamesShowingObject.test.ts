import { getScopedRelationFieldNamesShowingObject } from '@/object-record/record-column-scope/utils/getScopedRelationFieldNamesShowingObject';

const PERSON_OBJECT_METADATA_ITEM_ID = 'person-object-metadata-item-id';
const OPPORTUNITY_OBJECT_METADATA_ITEM_ID =
  'opportunity-object-metadata-item-id';

const SCOPED_RELATION_ALIASES = [
  {
    relationFieldName: 'people',
    relationObjectMetadataItem: { id: PERSON_OBJECT_METADATA_ITEM_ID },
  },
  {
    relationFieldName: 'people',
    relationObjectMetadataItem: { id: PERSON_OBJECT_METADATA_ITEM_ID },
  },
  {
    relationFieldName: 'opportunities',
    relationObjectMetadataItem: { id: OPPORTUNITY_OBJECT_METADATA_ITEM_ID },
  },
];

describe('getScopedRelationFieldNamesShowingObject', () => {
  it('returns each relation showing the written object once', () => {
    expect(
      getScopedRelationFieldNamesShowingObject({
        scopedRelationAliases: SCOPED_RELATION_ALIASES,
        objectMetadataItemId: PERSON_OBJECT_METADATA_ITEM_ID,
      }),
    ).toEqual(['people']);
  });

  it('returns nothing when no scoped column shows the written object', () => {
    expect(
      getScopedRelationFieldNamesShowingObject({
        scopedRelationAliases: SCOPED_RELATION_ALIASES,
        objectMetadataItemId: 'company-object-metadata-item-id',
      }),
    ).toEqual([]);
  });
});
