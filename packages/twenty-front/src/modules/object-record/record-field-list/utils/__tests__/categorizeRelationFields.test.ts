import { categorizeRelationFields } from '@/object-record/record-field-list/utils/categorizeRelationFields';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('categorizeRelationFields', () => {
  it('categorizes configured activity junctions as regular inline junctions', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });

    expect(
      categorizeRelationFields({
        relationFields: [taskTargetsField],
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toEqual({
      inlineRelationFields: [taskTargetsField],
      junctionRelationFields: [taskTargetsField],
      boxedRelationFields: [],
    });
  });

  it('does not expose an invalid configured junction as a regular relation', () => {
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
      categorizeRelationFields({
        relationFields: [invalidTaskTargetsField],
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toEqual({
      inlineRelationFields: [],
      junctionRelationFields: [],
      boxedRelationFields: [],
    });
  });
});
