import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { reportMissingRelationTargetMetadata } from '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata',
  () => ({
    reportMissingRelationTargetMetadata: jest.fn(),
  }),
);

type GenerateDepthRecordGqlFieldsFromFieldsInput = Parameters<
  typeof generateDepthRecordGqlFieldsFromFields
>[0];

type GenerateDepthRecordGqlFieldsFromFieldsField =
  GenerateDepthRecordGqlFieldsFromFieldsInput['fields'][number];

type GenerateDepthRecordGqlFieldsFromFieldsObjectMetadataItem =
  GenerateDepthRecordGqlFieldsFromFieldsInput['objectMetadataItems'][number];

const mockedReportMissingRelationTargetMetadata = jest.mocked(
  reportMissingRelationTargetMetadata,
);

describe('generateDepthRecordGqlFieldsFromFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip relation object fields when target metadata is missing', () => {
    const fields: GenerateDepthRecordGqlFieldsFromFieldsField[] = [
      {
        id: 'field-authored-notes',
        name: 'authoredNotes',
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.ONE_TO_MANY },
        morphRelations: [],
        relation: {
          targetObjectMetadata: {
            id: 'missing-note-object',
            nameSingular: 'note',
            namePlural: 'notes',
          },
        },
      } as GenerateDepthRecordGqlFieldsFromFieldsField,
    ];

    const objectMetadataItems: GenerateDepthRecordGqlFieldsFromFieldsObjectMetadataItem[] =
      [
        {
          id: 'project-object',
          fields: [],
          labelIdentifierFieldMetadataId: 'label-field-id',
          imageIdentifierFieldMetadataId: null,
          nameSingular: 'project',
          namePlural: 'projects',
        } as GenerateDepthRecordGqlFieldsFromFieldsObjectMetadataItem,
      ];

    const result = generateDepthRecordGqlFieldsFromFields({
      fields,
      objectMetadataItems,
      depth: 1,
    });

    expect(result).toEqual({});
    expect(mockedReportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: 'authoredNotes',
      missingTargetNames: ['note'],
      relationFieldType: 'relation',
    });
  });

  it('should keep available morph targets and report only missing targets', () => {
    const fields: GenerateDepthRecordGqlFieldsFromFieldsField[] = [
      {
        id: 'field-target',
        name: 'target',
        type: FieldMetadataType.MORPH_RELATION,
        settings: { relationType: RelationType.MANY_TO_ONE },
        relation: null,
        morphRelations: [
          {
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadata: {
              id: 'company-object',
              nameSingular: 'company',
              namePlural: 'companies',
            },
          },
          {
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadata: {
              id: 'missing-person-object',
              nameSingular: 'person',
              namePlural: 'people',
            },
          },
        ],
      } as GenerateDepthRecordGqlFieldsFromFieldsField,
    ];

    const objectMetadataItems: GenerateDepthRecordGqlFieldsFromFieldsObjectMetadataItem[] =
      [
        {
          id: 'company-object',
          fields: [],
          labelIdentifierFieldMetadataId: 'company-name-field-id',
          imageIdentifierFieldMetadataId: null,
          nameSingular: 'company',
          namePlural: 'companies',
        } as GenerateDepthRecordGqlFieldsFromFieldsObjectMetadataItem,
      ];

    const result = generateDepthRecordGqlFieldsFromFields({
      fields,
      objectMetadataItems,
      depth: 1,
    });

    expect(result.targetCompany).toEqual({
      id: true,
    });
    expect(result.targetCompanyId).toBe(true);
    expect(result.targetPerson).toBeUndefined();
    expect(result.targetPersonId).toBeUndefined();
    expect(mockedReportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: 'target',
      missingTargetNames: ['person'],
      relationFieldType: 'morph-relation',
    });
  });
});
