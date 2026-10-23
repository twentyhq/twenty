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

  it('skips a relation whose target object is not in the metadata', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const workspaceMemberMetadata =
      getMockObjectMetadataItemOrThrow('workspaceMember');
    const assigneeField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'assignee',
    });

    const recordGqlFields = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock().filter(
        ({ id }) => id !== workspaceMemberMetadata.id,
      ),
      sourceObjectMetadataItem: taskMetadata,
      fields: [assigneeField],
      depth: 1,
    });

    expect(recordGqlFields).toEqual({});
  });

  it('skips a morph target whose object is not in the metadata', () => {
    const noteTargetMetadata = getMockObjectMetadataItemOrThrow('noteTarget');
    const companyMetadata = getMockObjectMetadataItemOrThrow('company');
    const targetField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: noteTargetMetadata,
      fieldName: 'target',
    });

    const recordGqlFields = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock().filter(
        ({ id }) => id !== companyMetadata.id,
      ),
      sourceObjectMetadataItem: noteTargetMetadata,
      fields: [targetField],
      depth: 1,
    });

    expect(recordGqlFields).not.toHaveProperty('targetCompany');
    expect(recordGqlFields).not.toHaveProperty('targetCompanyId');
    expect(recordGqlFields).toHaveProperty('targetPerson');
    expect(recordGqlFields).toHaveProperty('targetPersonId');
  });
});
