import { getJunctionObjectMetadataIds } from '@/object-record/record-field/ui/utils/junction/getJunctionObjectMetadataIds';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getJunctionObjectMetadataIds', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const taskObjectMetadata = getMockObjectMetadataItemOrThrow('task');
  const taskTargetObjectMetadata =
    getMockObjectMetadataItemOrThrow('taskTarget');
  const taskTargetsField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem: taskObjectMetadata,
    fieldName: 'taskTargets',
  });

  it('includes objects reached through a valid junction configuration', () => {
    expect(getJunctionObjectMetadataIds(objectMetadataItems)).toContain(
      taskTargetObjectMetadata.id,
    );
  });

  it('does not make an invalid configured target eligible for junction cascade deletion', () => {
    const objectMetadataItemsWithInvalidTaskJunction = objectMetadataItems.map(
      (objectMetadataItem) =>
        objectMetadataItem.id === taskObjectMetadata.id
          ? {
              ...objectMetadataItem,
              fields: objectMetadataItem.fields.map((field) =>
                field.id === taskTargetsField.id
                  ? {
                      ...field,
                      settings: {
                        ...field.settings,
                        junctionTargetFieldId:
                          field.relation?.targetFieldMetadata.id,
                      },
                    }
                  : field,
              ),
            }
          : objectMetadataItem,
    );

    expect(
      getJunctionObjectMetadataIds(objectMetadataItemsWithInvalidTaskJunction),
    ).not.toContain(taskTargetObjectMetadata.id);
  });
});
