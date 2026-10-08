import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { resolveReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveReverseJunctionConfig';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { RelationType } from 'twenty-shared/types';

const cloneRelationPair = ({
  ownerField,
  junctionField,
  ownerFieldId,
  junctionFieldId,
  ownerFieldSettings,
}: {
  ownerField: FieldMetadataItem;
  junctionField: FieldMetadataItem;
  ownerFieldId: string;
  junctionFieldId: string;
  ownerFieldSettings: FieldMetadataItem['settings'];
}) => {
  const ownerRelation = ownerField.relation;
  const junctionRelation = junctionField.relation;

  if (!ownerRelation || !junctionRelation) {
    throw new Error('Relation pair not found');
  }

  return {
    ownerField: {
      ...ownerField,
      id: ownerFieldId,
      settings: ownerFieldSettings,
      relation: {
        ...ownerRelation,
        sourceFieldMetadata: {
          ...ownerRelation.sourceFieldMetadata,
          id: ownerFieldId,
        },
        targetFieldMetadata: {
          ...ownerRelation.targetFieldMetadata,
          id: junctionFieldId,
        },
      },
    },
    junctionField: {
      ...junctionField,
      id: junctionFieldId,
      relation: {
        ...junctionRelation,
        sourceFieldMetadata: {
          ...junctionRelation.sourceFieldMetadata,
          id: junctionFieldId,
        },
        targetFieldMetadata: {
          ...junctionRelation.targetFieldMetadata,
          id: ownerFieldId,
        },
      },
    },
  };
};

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

  it('resolves a merged morph relation through its physical member ID', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');
    const targetField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskTargetMetadata,
      fieldName: 'target',
    });
    const rocketTargetMemberId = targetField.morphRelations?.find(
      (relation) =>
        relation.targetObjectMetadata.id === rocketMetadata.id &&
        relation.sourceFieldMetadata.id !== targetField.id,
    )?.sourceFieldMetadata.id;
    const configuredTargetMemberId = targetField.morphRelations?.find(
      (relation) => relation.sourceFieldMetadata.id !== rocketTargetMemberId,
    )?.sourceFieldMetadata.id;
    const mismatchedTargetMemberId = targetField.morphRelations?.find(
      (relation) =>
        relation.sourceFieldMetadata.id !== rocketTargetMemberId &&
        relation.sourceFieldMetadata.id !== targetField.id,
    )?.sourceFieldMetadata.id;

    if (
      !rocketTargetMemberId ||
      !configuredTargetMemberId ||
      !mismatchedTargetMemberId
    ) {
      throw new Error('Task target morph members not found');
    }

    const metadataWithPhysicalMorphMemberSetting = objectMetadataItems.map(
      (item) =>
        item.id === taskMetadata.id
          ? {
              ...item,
              fields: item.fields.map((field) =>
                field.id === taskTargetsField.id
                  ? {
                      ...field,
                      settings: {
                        ...field.settings,
                        junctionTargetFieldId: configuredTargetMemberId,
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
        relationTargetFieldMetadataId: rocketTargetMemberId,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: metadataWithPhysicalMorphMemberSetting,
      }),
    ).toMatchObject({
      status: 'resolved',
      junctionConfig: {
        sourceField: { id: targetField.id },
        targetFields: [{ name: 'task' }],
        isConfiguredOnOwningSide: true,
      },
    });

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: taskTargetMetadata.id,
        relationTargetFieldMetadataId: mismatchedTargetMemberId,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: metadataWithPhysicalMorphMemberSetting,
      }),
    ).toEqual({ status: 'invalid' });
  });

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
    const taskField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskTargetMetadata,
      fieldName: 'task',
    });
    const stalePair = cloneRelationPair({
      ownerField: taskTargetsField,
      junctionField: taskField,
      ownerFieldId: 'stale-task-targets-field-id',
      junctionFieldId: 'stale-task-field-id',
      ownerFieldSettings: {
        junctionTargetFieldId: 'missing-target-field-id',
      },
    });

    const objectMetadataItemsWithUnrelatedInvalidConfig =
      objectMetadataItems.map((item) => {
        if (item.id === taskMetadata.id) {
          return {
            ...item,
            fields: [
              ...item.fields.map((field) =>
                field.id === taskTargetsField.id
                  ? { ...field, settings: undefined }
                  : field,
              ),
              stalePair.ownerField,
            ],
          };
        }

        return item.id === taskTargetMetadata.id
          ? { ...item, fields: [...item.fields, stalePair.junctionField] }
          : item;
      });

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

  it('ignores an owner-shaped field that is not the declared inverse edge', () => {
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

    if (!taskTargetsField.relation || !rocketTaskTargetsField.relation) {
      throw new Error('Task targets relation not found');
    }

    const taskTargetsRelation = taskTargetsField.relation;
    const rocketTaskTargetsRelation = rocketTaskTargetsField.relation;
    const objectMetadataItemsWithUnreferencedDuplicate =
      objectMetadataItems.map((item) =>
        item.id === taskMetadata.id
          ? {
              ...item,
              fields: [
                ...item.fields,
                {
                  ...taskTargetsField,
                  id: 'unreferenced-task-targets-field-id',
                  name: 'unreferencedTaskTargets',
                  relation: {
                    ...taskTargetsRelation,
                    sourceFieldMetadata: {
                      ...taskTargetsRelation.sourceFieldMetadata,
                      id: 'unreferenced-task-targets-field-id',
                      name: 'unreferencedTaskTargets',
                    },
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
          rocketTaskTargetsRelation.targetFieldMetadata.id,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: objectMetadataItemsWithUnreferencedDuplicate,
      }),
    ).toMatchObject({
      status: 'resolved',
      junctionConfig: {
        sourceField: { name: 'target' },
        targetFields: [{ name: 'task' }],
        isConfiguredOnOwningSide: true,
      },
    });
  });

  it('returns ambiguous when two declared inverse edges target the same reverse field', () => {
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
    const taskField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskTargetMetadata,
      fieldName: 'task',
    });

    const duplicateOwnerFieldId = 'duplicate-task-targets-field-id';
    const duplicateJunctionFieldId = 'duplicate-task-field-id';
    const duplicatePair = cloneRelationPair({
      ownerField: taskTargetsField,
      junctionField: taskField,
      ownerFieldId: duplicateOwnerFieldId,
      junctionFieldId: duplicateJunctionFieldId,
      ownerFieldSettings: taskTargetsField.settings,
    });
    const metadataWithTwoDeclaredInverseEdges = objectMetadataItems.map(
      (item) => {
        if (item.id === taskMetadata.id) {
          return {
            ...item,
            fields: [...item.fields, duplicatePair.ownerField],
          };
        }

        if (item.id === taskTargetMetadata.id) {
          return {
            ...item,
            fields: [...item.fields, duplicatePair.junctionField],
          };
        }

        return item;
      },
    );

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: taskTargetMetadata.id,
        relationTargetFieldMetadataId:
          rocketTaskTargetsField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: rocketMetadata.id,
        objectMetadataItems: metadataWithTwoDeclaredInverseEdges,
      }),
    ).toEqual({ status: 'ambiguous' });
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
    const metadataWithInvalidSourceOwnership = objectMetadataItems.map((item) =>
      item.id === taskTargetMetadata.id
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === taskTargetSourceFieldId && field.relation
                ? {
                    ...field,
                    relation: {
                      ...field.relation,
                      sourceObjectMetadata: {
                        ...field.relation.sourceObjectMetadata,
                        id: 'misowned-junction-object-id',
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
      metadataWithInvalidSourceOwnership,
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
