import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { reportMissingRelationTargetMetadata } from '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata';
import { computeMorphRelationGqlFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata',
  () => ({
    reportMissingRelationTargetMetadata: jest.fn(),
  }),
);

describe('generateDepthRecordGqlFieldsFromFields', () => {
  const mockedReportMissingRelationTargetMetadata = jest.mocked(
    reportMissingRelationTargetMetadata,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip missing relation target metadata and keep many-to-one id field', () => {
    const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

    const manyToOneRelationField = companyObjectMetadataItem.fields.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.type === FieldMetadataType.RELATION &&
        fieldMetadataItem.settings?.relationType === RelationType.MANY_TO_ONE &&
        isDefined(fieldMetadataItem.relation),
    );

    if (!manyToOneRelationField) {
      throw new Error('Many-to-one relation field not found in company metadata');
    }

    const result = generateDepthRecordGqlFieldsFromFields({
      fields: [manyToOneRelationField],
      objectMetadataItems: [],
      depth: 1,
      shouldOnlyLoadRelationIdentifiers: true,
    });

    expect(result[manyToOneRelationField.name]).toBeUndefined();
    expect(result[`${manyToOneRelationField.name}Id`]).toBe(true);
    expect(mockedReportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: manyToOneRelationField.name,
      relationFieldType: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
    });
  });

  it('should skip only missing morph relation targets and keep valid targets', () => {
    const timelineActivityObjectMetadataItem =
      getMockObjectMetadataItemOrThrow('timelineActivity');

    const morphRelationField = timelineActivityObjectMetadataItem.fields.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(fieldMetadataItem.morphRelations) &&
        fieldMetadataItem.morphRelations.length > 0,
    );

    if (!morphRelationField?.morphRelations?.[0]) {
      throw new Error('Morph relation field not found in timeline activity metadata');
    }

    const validMorphRelation = morphRelationField.morphRelations[0];

    const missingMorphRelation = {
      ...validMorphRelation,
      targetObjectMetadata: {
        ...validMorphRelation.targetObjectMetadata,
        id: 'missing-object-metadata-id',
        nameSingular: 'deletedObject',
        namePlural: 'deletedObjects',
      },
    };

    const result = generateDepthRecordGqlFieldsFromFields({
      fields: [
        {
          ...morphRelationField,
          morphRelations: [validMorphRelation, missingMorphRelation],
        },
      ],
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      depth: 1,
      shouldOnlyLoadRelationIdentifiers: true,
    });

    const validMorphRelationGqlField = computeMorphRelationGqlFieldName({
      fieldName: morphRelationField.name,
      relationType: validMorphRelation.type,
      targetObjectMetadataNameSingular:
        validMorphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        validMorphRelation.targetObjectMetadata.namePlural,
    });

    const missingMorphRelationGqlField = computeMorphRelationGqlFieldName({
      fieldName: morphRelationField.name,
      relationType: missingMorphRelation.type,
      targetObjectMetadataNameSingular:
        missingMorphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        missingMorphRelation.targetObjectMetadata.namePlural,
    });

    expect(result[validMorphRelationGqlField]).toEqual(
      expect.objectContaining({ id: true }),
    );
    expect(result[missingMorphRelationGqlField]).toBeUndefined();
    expect(mockedReportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: morphRelationField.name,
      relationFieldType: FieldMetadataType.MORPH_RELATION,
      relationType: morphRelationField.settings?.relationType,
      targetObjectMetadataNameSingular: 'deletedObject',
    });
  });
});
