import { categorizeRelationFields } from '@/object-record/record-field-list/utils/categorizeRelationFields';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toEqual({
      inlineRelationFields: [taskTargetsField],
      junctionRelationFields: [taskTargetsField],
      boxedRelationFields: [],
    });
  });
});
