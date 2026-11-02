import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

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

  it('omits relation field without throwing when targetObjectMetadata is not found', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const relationFieldWithMissingTarget = {
      name: 'brokenRelation',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      relation: {
        id: 'relation-id',
        sourceObjectMetadata: { id: taskMetadata.id },
        targetObjectMetadata: { id: 'non-existent-target-object-id' },
        targetFieldMetadata: { id: 'target-field-id' },
      },
    };

    expect(() =>
      generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        sourceObjectMetadataItem: taskMetadata,
        fields: [relationFieldWithMissingTarget as any],
        depth: 1,
      }),
    ).not.toThrow();

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      sourceObjectMetadataItem: taskMetadata,
      fields: [relationFieldWithMissingTarget as any],
      depth: 1,
    });

    expect(result).not.toHaveProperty('brokenRelation');
  });

  it('omits relation field without throwing when relation is undefined', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const relationFieldWithoutRelation = {
      name: 'orphanedRelation',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      relation: undefined,
    };

    expect(() =>
      generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        sourceObjectMetadataItem: taskMetadata,
        fields: [relationFieldWithoutRelation as any],
        depth: 1,
      }),
    ).not.toThrow();

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      sourceObjectMetadataItem: taskMetadata,
      fields: [relationFieldWithoutRelation as any],
      depth: 1,
    });

    expect(result).not.toHaveProperty('orphanedRelation');
  });

  it('omits unresolvable morph relation target without throwing', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const morphFieldWithMissingTarget = {
      name: 'target',
      type: FieldMetadataType.MORPH_RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      morphRelations: [
        {
          id: 'morph-1',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadata: {
            id: 'non-existent-morph-target-id',
            nameSingular: 'missingObject',
            namePlural: 'missingObjects',
          },
        },
      ],
    };

    expect(() =>
      generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        sourceObjectMetadataItem: taskMetadata,
        fields: [morphFieldWithMissingTarget as any],
        depth: 1,
      }),
    ).not.toThrow();

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      sourceObjectMetadataItem: taskMetadata,
      fields: [morphFieldWithMissingTarget as any],
      depth: 1,
    });

    expect(result).toEqual({});
  });
});
