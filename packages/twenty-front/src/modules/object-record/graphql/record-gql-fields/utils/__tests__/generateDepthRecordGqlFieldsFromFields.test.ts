import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { reportMissingRelationTargetMetadata } from '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationGqlFieldName, isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata',
  () => ({
    reportMissingRelationTargetMetadata: jest.fn(),
  }),
);

const mockedReportMissingRelationTargetMetadata = jest.mocked(
  reportMissingRelationTargetMetadata,
);

describe('generateDepthRecordGqlFieldsFromFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip missing morph targets and report metadata mismatch', () => {
    const timelineActivityObjectMetadataItem = getMockObjectMetadataItemOrThrow(
      'timelineActivity',
    );

    const targetFieldMetadataItem = timelineActivityObjectMetadataItem.fields.find(
      (fieldMetadataItem) => fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION,
    );

    if (!isDefined(targetFieldMetadataItem)) {
      throw new Error('Expected timelineActivity to have a morph relation field');
    }

    const removedMorphRelation = targetFieldMetadataItem.morphRelations?.[0];

    if (!isDefined(removedMorphRelation)) {
      throw new Error('Expected morph relation field to have at least one target');
    }

    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().filter(
      (objectMetadataItem) =>
        objectMetadataItem.id !== removedMorphRelation.targetObjectMetadata.id,
    );

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      fields: [targetFieldMetadataItem],
      depth: 1,
      shouldOnlyLoadRelationIdentifiers: true,
    });

    const keptMorphRelation = targetFieldMetadataItem.morphRelations?.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.id !==
        removedMorphRelation.targetObjectMetadata.id,
    );

    if (!isDefined(keptMorphRelation)) {
      throw new Error('Expected at least one remaining morph relation target');
    }

    const keptMorphRelationGqlField = computeMorphRelationGqlFieldName({
      fieldName: targetFieldMetadataItem.name,
      relationType: keptMorphRelation.type,
      targetObjectMetadataNameSingular:
        keptMorphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        keptMorphRelation.targetObjectMetadata.namePlural,
    });

    expect(result[keptMorphRelationGqlField]).toBeDefined();
    expect(mockedReportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: targetFieldMetadataItem.name,
      missingTargetNames: [
        removedMorphRelation.targetObjectMetadata.nameSingular,
      ],
      relationFieldType: 'morph-relation',
    });
  });

  it('should skip missing relation target and keep many-to-one id field', () => {
    const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

    const manyToOneRelationFieldMetadataItem = companyObjectMetadataItem.fields.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.type === FieldMetadataType.RELATION &&
        fieldMetadataItem.settings?.relationType === RelationType.MANY_TO_ONE &&
        isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id),
    );

    if (!isDefined(manyToOneRelationFieldMetadataItem)) {
      throw new Error('Expected company to have a MANY_TO_ONE relation field');
    }

    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().filter(
      (objectMetadataItem) =>
        objectMetadataItem.id !==
        manyToOneRelationFieldMetadataItem.relation?.targetObjectMetadata.id,
    );

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      fields: [manyToOneRelationFieldMetadataItem],
      depth: 1,
    });

    expect(result[manyToOneRelationFieldMetadataItem.name]).toBeUndefined();
    expect(result[`${manyToOneRelationFieldMetadataItem.name}Id`]).toBe(true);
    expect(mockedReportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: manyToOneRelationFieldMetadataItem.name,
      missingTargetNames: [
        manyToOneRelationFieldMetadataItem.relation?.targetObjectMetadata
          .nameSingular ?? 'unknown-target',
      ],
      relationFieldType: 'relation',
    });
  });
});
