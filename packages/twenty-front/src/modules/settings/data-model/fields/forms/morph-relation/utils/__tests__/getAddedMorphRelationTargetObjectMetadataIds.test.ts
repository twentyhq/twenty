import { getAddedMorphRelationTargetObjectMetadataIds } from '@/settings/data-model/fields/forms/morph-relation/utils/getAddedMorphRelationTargetObjectMetadataIds';

const toSavedMorphRelations = (targetObjectMetadataIds: string[]) =>
  targetObjectMetadataIds.map((id) => ({ targetObjectMetadata: { id } }));

describe('getAddedMorphRelationTargetObjectMetadataIds', () => {
  it('returns only the selected destinations that are not saved yet', () => {
    expect(
      getAddedMorphRelationTargetObjectMetadataIds({
        savedMorphRelations: toSavedMorphRelations(['company', 'person']),
        selectedObjectMetadataIds: ['company', 'opportunity', 'person', 'task'],
      }),
    ).toEqual(['opportunity', 'task']);
  });

  it('returns nothing when the selection matches the saved destinations', () => {
    expect(
      getAddedMorphRelationTargetObjectMetadataIds({
        savedMorphRelations: toSavedMorphRelations(['company']),
        selectedObjectMetadataIds: ['company'],
      }),
    ).toEqual([]);
  });

  it('adds destinations to a morph field that has none left', () => {
    expect(
      getAddedMorphRelationTargetObjectMetadataIds({
        savedMorphRelations: null,
        selectedObjectMetadataIds: ['company', 'company'],
      }),
    ).toEqual(['company']);
  });

  it('returns nothing when the form has no selection', () => {
    expect(
      getAddedMorphRelationTargetObjectMetadataIds({
        savedMorphRelations: toSavedMorphRelations(['company']),
      }),
    ).toEqual([]);
  });
});
