import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { getJunctionObjectMetadataIds } from '@/object-record/record-field/ui/utils/junction/getJunctionObjectMetadataIds';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('resolveJunctionConfig', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  const resolveField = (
    objectMetadataItem: EnrichedObjectMetadataItem,
    fieldName: string,
    metadataItems = objectMetadataItems,
  ) => {
    const field = getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName,
    });

    return resolveJunctionConfig({
      settings: field.settings,
      relationObjectMetadataId: field.relation?.targetObjectMetadata.id ?? '',
      relationTargetFieldMetadataId: field.relation?.targetFieldMetadata.id,
      sourceObjectMetadataId: objectMetadataItem.id,
      objectMetadataItems: metadataItems,
    });
  };

  it('keeps the configured owning side as forward', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');

    expect(resolveField(taskMetadata, 'taskTargets')).toMatchObject({
      direction: 'forward',
      junctionObjectMetadata: { nameSingular: 'taskTarget' },
      sourceField: { name: 'task' },
      targetFields: [{ name: 'target' }],
      isMorphRelation: true,
    });
  });

  it('normalizes the inverse side to edit terminal records', () => {
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');

    expect(resolveField(rocketMetadata, 'taskTargets')).toMatchObject({
      direction: 'reverse',
      junctionObjectMetadata: { nameSingular: 'taskTarget' },
      sourceField: { name: 'target' },
      targetFields: [{ name: 'task' }],
      isMorphRelation: false,
    });
  });

  it('normalizes compatible configured owners into one reverse morph target', () => {
    const petMetadata = getMockObjectMetadataItemOrThrow('pet');
    const petMetadataWithoutLocalJunctionMarker = {
      ...petMetadata,
      fields: petMetadata.fields.map((field) =>
        field.name === 'caretakers' ? { ...field, settings: undefined } : field,
      ),
    };
    const metadataWithoutLocalJunctionMarker = objectMetadataItems.map((item) =>
      item.id === petMetadata.id ? petMetadataWithoutLocalJunctionMarker : item,
    );

    expect(
      resolveField(
        petMetadataWithoutLocalJunctionMarker,
        'caretakers',
        metadataWithoutLocalJunctionMarker,
      ),
    ).toMatchObject({
      direction: 'reverse',
      sourceField: { name: 'pet' },
      targetFields: [{ name: 'caretaker' }],
      isMorphRelation: true,
    });
  });

  it('discovers a configured morph field owning the junction', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });

    if (!taskTargetsField.relation) {
      throw new Error('Task targets relation not found');
    }

    const morphOwningField = {
      ...taskTargetsField,
      type: FieldMetadataType.MORPH_RELATION,
      relation: undefined,
      morphRelations: [taskTargetsField.relation],
    } as FieldMetadataItem;
    const metadataWithMorphOwner = objectMetadataItems.map((item) =>
      item.id === taskMetadata.id
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === taskTargetsField.id ? morphOwningField : field,
            ),
          }
        : item,
    );
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');

    expect(
      resolveField(rocketMetadata, 'taskTargets', metadataWithMorphOwner),
    ).toMatchObject({
      direction: 'reverse',
      junctionObjectMetadata: { nameSingular: 'taskTarget' },
      sourceField: { name: 'target' },
      targetFields: [{ name: 'task' }],
      isMorphRelation: false,
    });
    expect(getJunctionObjectMetadataIds(metadataWithMorphOwner)).toContain(
      taskTargetsField.relation.targetObjectMetadata.id,
    );
  });

  it('prefers an explicit forward configuration when both directions match', () => {
    const personMetadata = getMockObjectMetadataItemOrThrow('person');

    expect(resolveField(personMetadata, 'previousCompanies')).toMatchObject({
      direction: 'forward',
      sourceField: { name: 'person' },
      targetFields: [{ name: 'company' }],
    });
  });

  it('returns null for a direct relation', () => {
    const personMetadata = getMockObjectMetadataItemOrThrow('person');

    expect(resolveField(personMetadata, 'company')).toBeNull();
  });

  it('fails closed when more than one owning field matches the inverse', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const metadataWithAmbiguousOwner = objectMetadataItems.map((item) =>
      item.id === taskMetadata.id
        ? {
            ...item,
            fields: [
              ...item.fields,
              {
                ...taskTargetsField,
                id: 'duplicate-task-targets-field-id',
                name: 'duplicateTaskTargets',
              },
            ],
          }
        : item,
    );

    expect(
      resolveField(rocketMetadata, 'taskTargets', metadataWithAmbiguousOwner),
    ).toMatchObject({
      isValid: false,
      junctionObjectMetadata: { nameSingular: 'taskTarget' },
      targetFields: [],
    });

    const rocketTaskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: rocketMetadata,
      fieldName: 'taskTargets',
    });

    expect(
      generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: metadataWithAmbiguousOwner,
        sourceObjectMetadataItem: rocketMetadata,
        fields: [rocketTaskTargetsField],
        depth: 1,
      }),
    ).not.toHaveProperty('taskTargets');
  });

  it('fails closed when a configured owning field is invalid', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });

    const configuredTargetFieldId =
      taskTargetsField.settings?.junctionTargetFieldId;

    if (typeof configuredTargetFieldId !== 'string') {
      throw new Error('Task target junction configuration not found');
    }

    const metadataWithInvalidOwner = objectMetadataItems.map((item) =>
      item.id === taskTargetMetadata.id
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === configuredTargetFieldId
                ? {
                    ...field,
                    type: FieldMetadataType.TEXT,
                    relation: undefined,
                    morphRelations: undefined,
                  }
                : field,
            ),
          }
        : item,
    );

    expect(
      resolveField(rocketMetadata, 'taskTargets', metadataWithInvalidOwner),
    ).toMatchObject({
      isValid: false,
      junctionObjectMetadata: { nameSingular: 'taskTarget' },
      targetFields: [],
    });
    expect(
      getJunctionObjectMetadataIds(metadataWithInvalidOwner),
    ).not.toContain(taskTargetMetadata.id);
  });

  it('fails closed when a reverse owner points to a missing target field', () => {
    const taskMetadata = getMockObjectMetadataItemOrThrow('task');
    const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
    const taskTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: taskMetadata,
      fieldName: 'taskTargets',
    });
    const metadataWithStaleOwner = objectMetadataItems.map((item) =>
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
      resolveField(rocketMetadata, 'taskTargets', metadataWithStaleOwner),
    ).toMatchObject({
      direction: 'reverse',
      isValid: false,
      targetFields: [],
    });
  });

  it('keeps morph terminal semantics when the owning-side source is morph', () => {
    const sourceObject = {
      id: 'source-object-id',
      nameSingular: 'sourceObject',
      namePlural: 'sourceObjects',
    };
    const ownerObject = {
      id: 'owner-object-id',
      nameSingular: 'ownerObject',
      namePlural: 'ownerObjects',
    };
    const junctionObject = {
      id: 'junction-object-id',
      nameSingular: 'junctionObject',
      namePlural: 'junctionObjects',
    };
    const inverseSourceField = {
      id: 'inverse-source-field-id',
      name: 'junctionObjects',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
      relation: {
        type: RelationType.ONE_TO_MANY,
        sourceObjectMetadata: sourceObject,
        targetObjectMetadata: junctionObject,
        sourceFieldMetadata: {
          id: 'inverse-source-field-id',
          name: 'junctionObjects',
        },
        targetFieldMetadata: {
          id: 'junction-source-field-id',
          name: 'sourceObject',
        },
      },
    } as FieldMetadataItem;
    const morphOwnerField = {
      id: 'junction-owner-field-id',
      name: 'ownerObject',
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        {
          type: RelationType.MANY_TO_ONE,
          sourceObjectMetadata: junctionObject,
          targetObjectMetadata: ownerObject,
          sourceFieldMetadata: {
            id: 'junction-owner-field-id',
            name: 'ownerObject',
          },
          targetFieldMetadata: {
            id: 'owner-junction-field-id',
            name: 'junctionObjects',
          },
        },
      ],
    } as FieldMetadataItem;
    const junctionSourceField = {
      id: 'junction-source-field-id',
      name: 'sourceObject',
      type: FieldMetadataType.RELATION,
      relation: {
        type: RelationType.MANY_TO_ONE,
        sourceObjectMetadata: junctionObject,
        targetObjectMetadata: sourceObject,
        sourceFieldMetadata: {
          id: 'junction-source-field-id',
          name: 'sourceObject',
        },
        targetFieldMetadata: {
          id: 'inverse-source-field-id',
          name: 'junctionObjects',
        },
      },
    } as FieldMetadataItem;
    const ownerJunctionField = {
      id: 'owner-junction-field-id',
      name: 'junctionObjects',
      type: FieldMetadataType.RELATION,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldId: junctionSourceField.id,
      },
      relation: {
        type: RelationType.ONE_TO_MANY,
        sourceObjectMetadata: ownerObject,
        targetObjectMetadata: junctionObject,
        sourceFieldMetadata: {
          id: 'owner-junction-field-id',
          name: 'junctionObjects',
        },
        targetFieldMetadata: {
          id: morphOwnerField.id,
          name: morphOwnerField.name,
        },
      },
    } as FieldMetadataItem;
    const labelIdentifierField = {
      id: 'junction-label-field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
    } as FieldMetadataItem;
    const metadataItems = [
      { ...sourceObject, fields: [inverseSourceField] },
      { ...ownerObject, fields: [ownerJunctionField] },
      {
        ...junctionObject,
        labelIdentifierFieldMetadataId: labelIdentifierField.id,
        fields: [labelIdentifierField, morphOwnerField, junctionSourceField],
      },
    ] as EnrichedObjectMetadataItem[];

    const resolverArgs = {
      settings: inverseSourceField.settings,
      relationObjectMetadataId: junctionObject.id,
      relationTargetFieldMetadataId: junctionSourceField.id,
      sourceObjectMetadataId: sourceObject.id,
    };

    expect(
      resolveJunctionConfig({
        ...resolverArgs,
        objectMetadataItems: metadataItems,
      }),
    ).toMatchObject({
      direction: 'reverse',
      sourceField: { id: junctionSourceField.id },
      targetFields: [{ id: morphOwnerField.id }],
      isMorphRelation: true,
    });

    const metadataWithAmbiguousOwner = metadataItems.map((item) =>
      item.id === ownerObject.id
        ? {
            ...item,
            fields: [
              ...item.fields,
              {
                ...ownerJunctionField,
                id: 'duplicate-owner-junction-field-id',
                name: 'duplicateJunctionObjects',
              },
            ],
          }
        : item,
    );

    expect(
      resolveJunctionConfig({
        ...resolverArgs,
        objectMetadataItems: metadataWithAmbiguousOwner,
      }),
    ).toMatchObject({
      isValid: false,
      junctionObjectMetadata: { id: junctionObject.id },
      targetFields: [],
    });
  });

  it('keeps an explicit junction fail-closed when target metadata is absent', () => {
    expect(
      resolveJunctionConfig({
        settings: { junctionTargetFieldId: 'missing-target-field-id' },
        relationObjectMetadataId: 'missing-junction-object-id',
        sourceObjectMetadataId: 'source-object-id',
        objectMetadataItems: [],
      }),
    ).toEqual({
      targetFields: [],
      isMorphRelation: false,
      direction: 'forward',
      isValid: false,
    });
  });
});
