import { getScopedRelationFieldNamesShowingObject } from '@/object-record/record-column-scope/utils/getScopedRelationFieldNamesShowingObject';

const PERSON_OBJECT_METADATA_ITEM_ID = 'person-object-metadata-item-id';
const OPPORTUNITY_OBJECT_METADATA_ITEM_ID =
  'opportunity-object-metadata-item-id';
const TASK_TARGET_OBJECT_METADATA_ITEM_ID =
  'task-target-object-metadata-item-id';
const TASK_OBJECT_METADATA_ITEM_ID = 'task-object-metadata-item-id';

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
  {
    relationFieldName: 'taskTargets',
    relationObjectMetadataItem: { id: TASK_TARGET_OBJECT_METADATA_ITEM_ID },
    scopedRelationJunction: {
      targetObjectMetadataItem: { id: TASK_OBJECT_METADATA_ITEM_ID },
    },
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

  it('returns a join object relation when its target object is written', () => {
    expect(
      getScopedRelationFieldNamesShowingObject({
        scopedRelationAliases: SCOPED_RELATION_ALIASES,
        objectMetadataItemId: TASK_OBJECT_METADATA_ITEM_ID,
      }),
    ).toEqual(['taskTargets']);
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
