import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { resolveReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveReverseJunctionConfig';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { RelationType } from 'twenty-shared/types';

describe('resolveReverseJunctionConfig', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const companyMetadata = getMockObjectMetadataItemOrThrow('company');

  it.each([
    {
      reverseFieldName: 'noteTargets',
      junctionObjectNameSingular: 'noteTarget',
      targetFieldName: 'note',
    },
    {
      reverseFieldName: 'taskTargets',
      junctionObjectNameSingular: 'taskTarget',
      targetFieldName: 'task',
    },
  ])(
    'normalizes $reverseFieldName into source and target fields',
    ({ reverseFieldName, junctionObjectNameSingular, targetFieldName }) => {
      const reverseField = getMockFieldMetadataItemOrThrow({
        objectMetadataItem: companyMetadata,
        fieldName: reverseFieldName,
      });
      const junctionObjectMetadata = getMockObjectMetadataItemOrThrow(
        junctionObjectNameSingular,
      );

      const result = resolveReverseJunctionConfig({
        junctionObjectMetadataId: junctionObjectMetadata.id,
        relationTargetFieldMetadataId:
          reverseField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: companyMetadata.id,
        objectMetadataItems,
      });

      expect(result).toMatchObject({
        status: 'resolved',
        junctionConfig: {
          junctionObjectMetadata: { id: junctionObjectMetadata.id },
          sourceField: { id: reverseField.relation?.targetFieldMetadata.id },
          targetFields: [{ name: targetFieldName }],
          isMorphRelation: false,
        },
      });
    },
  );

  it('returns not-found when no junction targets the source object', () => {
    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId:
          getMockObjectMetadataItemOrThrow('noteTarget').id,
        relationTargetFieldMetadataId: 'unsupported-target-field-id',
        sourceObjectMetadataId: 'unsupported-object-id',
        objectMetadataItems,
      }),
    ).toEqual({ status: 'not-found' });
  });

  it('collapses distinct owning-object branches of the same morph field', () => {
    const petMetadata = getMockObjectMetadataItemOrThrow('pet');
    const caretakersField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: petMetadata,
      fieldName: 'caretakers',
    });
    const petCareAgreementMetadata =
      getMockObjectMetadataItemOrThrow('petCareAgreement');

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: petCareAgreementMetadata.id,
        relationTargetFieldMetadataId:
          caretakersField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: petMetadata.id,
        objectMetadataItems,
      }),
    ).toMatchObject({
      status: 'resolved',
      junctionConfig: {
        sourceField: { name: 'pet' },
        targetFields: [{ name: 'caretaker' }],
        isMorphRelation: true,
      },
    });
  });

  it('ignores an invalid configuration for another inverse field on the same junction', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const rocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: rocketMetadata,
      fieldName: 'taskTargets',
    });
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');

    if (!taskTargetsField.relation) {
      throw new Error('Task targets relation not found');
    }

    const taskTargetSourceFieldId =
      taskTargetsField.relation.targetFieldMetadata.id;

    const objectMetadataItemsWithUnrelatedInvalidConfig =
      objectMetadataItems.map((item) =>
        item.id === taskMetadata.id
          ? {
              ...item,
              fields: [
                ...item.fields,
                {
                  ...taskTargetsField,
                  id: 'unrelated-invalid-task-targets-field-id',
                  name: 'unrelatedInvalidTaskTargets',
                  settings: {
                    ...taskTargetsField.settings,
                    junctionTargetFieldId: taskTargetSourceFieldId,
                  },
                },
              ],
            }
          : item,
      );

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: taskTargetMetadata.id,
        relationTargetFieldMetadataId:
          rocketTaskTargetsField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: objectMetadataItemsWithUnrelatedInvalidConfig,
      }),
    ).toMatchObject({
      status: 'resolved',
      junctionConfig: {
        sourceField: { name: 'target' },
        targetFields: [{ name: 'task' }],
      },
    });
  });

  it('returns invalid instead of falling back when the only configured target is stale', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const rocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: rocketMetadata,
      fieldName: 'taskTargets',
    });
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');
    const metadataWithStaleTarget = objectMetadataItems.map((item) =>
      item.id === taskMetadata.id
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === taskTargetsField.id
                ? {
                    ...field,
                    settings: {
                      ...field.settings,
                      junctionTargetFieldId: 'missing-target-field-id',
                    },
                  }
                : field,
            ),
          }
        : item,
    );

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: taskTargetMetadata.id,
        relationTargetFieldMetadataId:
          rocketTaskTargetsField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: metadataWithStaleTarget,
      }),
    ).toEqual({ status: 'invalid' });
  });

  it('returns invalid when a candidate no longer points to its declared endpoints', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const rocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: rocketMetadata,
      fieldName: 'taskTargets',
    });
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');
    const taskTargetSourceFieldId =
      taskTargetsField.relation?.targetFieldMetadata.id;
    const taskTargetTargetFieldId =
      rocketTaskTargetsField.relation?.targetFieldMetadata.id;
    const metadataWithInvalidSourceEndpoint = objectMetadataItems.map((item) =>
      item.id === taskTargetMetadata.id
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === taskTargetSourceFieldId && field.relation
                ? {
                    ...field,
                    relation: {
                      ...field.relation,
                      targetObjectMetadata: {
                        ...field.relation.targetObjectMetadata,
                        id: 'missing-owner-object-id',
                      },
                    },
                  }
                : field,
            ),
          }
        : item,
    );
    const metadataWithInvalidTargetEndpoint = objectMetadataItems.map((item) =>
      item.id === taskTargetMetadata.id
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === taskTargetTargetFieldId
                ? {
                    ...field,
                    morphRelations: field.morphRelations?.map((relation) =>
                      relation.targetObjectMetadata.id === rocketMetadata.id
                        ? {
                            ...relation,
                            targetObjectMetadata: {
                              ...relation.targetObjectMetadata,
                              id: 'missing-source-object-id',
                            },
                          }
                        : relation,
                    ),
                  }
                : field,
            ),
          }
        : item,
    );
    const resolverArgs = {
      junctionObjectMetadataId: taskTargetMetadata.id,
      relationTargetFieldMetadataId: taskTargetTargetFieldId,
      sourceObjectMetadataId: rocketMetadata.id,
    };

    for (const metadataItems of [
      metadataWithInvalidSourceEndpoint,
      metadataWithInvalidTargetEndpoint,
    ]) {
      expect(
        resolveReverseJunctionConfig({
          ...resolverArgs,
          objectMetadataItems: metadataItems,
        }),
      ).toEqual({ status: 'invalid' });
    }
  });

  it('returns invalid when the normalized target is not many-to-one', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const rocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: rocketMetadata,
      fieldName: 'taskTargets',
    });
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');
    const taskTargetSourceFieldId =
      taskTargetsField.relation?.targetFieldMetadata.id;
    const metadataWithInvalidNormalizedTarget = objectMetadataItems.map(
      (item) =>
        item.id === taskTargetMetadata.id
          ? {
              ...item,
              fields: item.fields.map((field) =>
                field.id === taskTargetSourceFieldId && field.relation
                  ? {
                      ...field,
                      relation: {
                        ...field.relation,
                        type: RelationType.ONE_TO_MANY,
                      },
                    }
                  : field,
              ),
            }
          : item,
    );

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: taskTargetMetadata.id,
        relationTargetFieldMetadataId:
          rocketTaskTargetsField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: metadataWithInvalidNormalizedTarget,
      }),
    ).toEqual({ status: 'invalid' });
  });

  it('generates reverse relation fields without activity-specific names', () => {
    const noteTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: companyMetadata,
      fieldName: 'noteTargets',
    });

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      sourceObjectMetadataItem: companyMetadata,
      fields: [noteTargetsField],
      depth: 1,
    });

    expect(result).toMatchObject({
      noteTargets: {
        id: true,
        note: {
          id: true,
          title: true,
        },
      },
    });
  });
});
