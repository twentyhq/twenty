import { getScopedRelationFieldNamesReachingObject } from '@/object-record/record-column-scope/utils/getScopedRelationFieldNamesReachingObject';

const PERSON_OBJECT_METADATA_ITEM_ID = 'person-object-metadata-item-id';
const OPPORTUNITY_OBJECT_METADATA_ITEM_ID =
  'opportunity-object-metadata-item-id';

const SCOPED_RELATION_ALIASES = [
  {
    reachedObjectMetadataItemIds: [PERSON_OBJECT_METADATA_ITEM_ID],
    relationWithArguments: { relationFieldName: 'people' },
  },
  {
    reachedObjectMetadataItemIds: [PERSON_OBJECT_METADATA_ITEM_ID],
    relationWithArguments: { relationFieldName: 'people' },
  },
  {
    // Opportunities filtered on their point of contact's job title
    reachedObjectMetadataItemIds: [
      OPPORTUNITY_OBJECT_METADATA_ITEM_ID,
      PERSON_OBJECT_METADATA_ITEM_ID,
    ],
    relationWithArguments: { relationFieldName: 'opportunities' },
  },
];

describe('getScopedRelationFieldNamesReachingObject', () => {
  it('returns each relation listing or filtering through the written object once', () => {
    expect(
      getScopedRelationFieldNamesReachingObject({
        scopedRelationAliases: SCOPED_RELATION_ALIASES,
        objectMetadataItemId: PERSON_OBJECT_METADATA_ITEM_ID,
      }),
    ).toEqual(['people', 'opportunities']);
  });

  it('returns nothing when no scoped column reaches the written object', () => {
    expect(
      getScopedRelationFieldNamesReachingObject({
        scopedRelationAliases: SCOPED_RELATION_ALIASES,
        objectMetadataItemId: 'company-object-metadata-item-id',
      }),
    ).toEqual([]);
  });
});
