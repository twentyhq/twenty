import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getFieldMetadataItemByIdOrThrow', () => {
  it('returns a merged morph field for one of its physical member IDs', () => {
    const taskTargetObjectMetadata =
      getMockObjectMetadataItemOrThrow('taskTarget');
    const targetMorphField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskTargetObjectMetadata,
      fieldName: 'target',
    });
    const morphMemberId = targetMorphField.morphRelations?.find(
      ({ sourceFieldMetadata }) =>
        sourceFieldMetadata.id !== targetMorphField.id,
    )?.sourceFieldMetadata.id;

    if (!morphMemberId) {
      throw new Error('Non-representative task target morph member not found');
    }

    expect(
      getFieldMetadataItemByIdOrThrow({
        fieldMetadataId: morphMemberId,
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      }),
    ).toMatchObject({
      objectMetadataItem: { nameSingular: 'taskTarget' },
      fieldMetadataItem: { id: targetMorphField.id, name: 'target' },
    });
  });
});
