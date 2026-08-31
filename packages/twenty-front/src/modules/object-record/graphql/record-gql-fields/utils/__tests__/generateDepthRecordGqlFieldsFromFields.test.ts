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
});
