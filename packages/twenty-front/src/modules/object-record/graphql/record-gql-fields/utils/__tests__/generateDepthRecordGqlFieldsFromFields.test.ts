import { getPermittedFields } from '@/object-metadata/utils/getPermittedFields';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('generateDepthRecordGqlFieldsFromFields', () => {
  it('does not query pivots for an invalid configured junction', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });

    if (!taskTargetsField.relation) {
      throw new Error('Task targets relation not found');
    }

    const invalidTaskTargetsField = {
      ...taskTargetsField,
      settings: {
        ...taskTargetsField.settings,
        junctionTargetFieldId: taskTargetsField.relation.targetFieldMetadata.id,
      },
    };

    expect(
      generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        sourceObjectMetadataItem: taskMetadata,
        fields: [invalidTaskTargetsField],
        depth: 1,
      }),
    ).not.toHaveProperty('taskTargets');
  });

  it('does not query junction morph targets the role cannot read', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');
    const companyTargetSourceFieldMetadataId = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskTargetMetadata,
      fieldName: 'target',
    }).morphRelations?.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.nameSingular === 'company',
    )?.sourceFieldMetadata.id;

    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().map(
      (objectMetadataItem) =>
        objectMetadataItem.id === taskTargetMetadata.id
          ? {
              ...objectMetadataItem,
              ...getPermittedFields({
                fields: objectMetadataItem.fields,
                objectPermissions: {
                  restrictedFields: {
                    [companyTargetSourceFieldMetadataId as string]: {
                      canRead: false,
                      canUpdate: false,
                    },
                  },
                },
              }),
            }
          : objectMetadataItem,
    );

    const { taskTargets } = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      sourceObjectMetadataItem: taskMetadata,
      fields: [taskTargetsField],
      depth: 1,
    });

    expect(taskTargets).toHaveProperty('targetPerson');
    expect(taskTargets).not.toHaveProperty('targetCompany');
  });
});
