import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { reportMissingRelationTargetMetadata } from '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/reportMissingRelationTargetMetadata',
  () => ({
    reportMissingRelationTargetMetadata: jest.fn(),
  }),
);

describe('generateDepthRecordGqlFieldsFromFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip relation object fields and keep id field when target metadata is missing for many to one relation', () => {
    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: [],
      fields: [
        {
          id: 'field-id',
          name: 'company',
          type: FieldMetadataType.RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
          morphRelations: null,
          relation: {
            targetObjectMetadata: {
              id: 'missing-object-id',
              nameSingular: 'company',
              namePlural: 'companies',
            },
          },
        },
      ],
      depth: 1,
    });

    expect(result).toEqual({
      companyId: true,
    });
    expect(reportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: 'company',
      missingTargetNames: ['company'],
      relationFieldType: 'relation',
    });
  });

  it('should skip only missing morph targets and keep available morph targets', () => {
    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: [
        {
          id: 'present-object-id',
          fields: [],
          labelIdentifierFieldMetadataId: null,
          imageIdentifierFieldMetadataId: null,
          nameSingular: 'person',
          namePlural: 'people',
        },
      ],
      fields: [
        {
          id: 'field-id',
          name: 'target',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
          relation: null,
          morphRelations: [
            {
              type: RelationType.MANY_TO_ONE,
              targetObjectMetadata: {
                id: 'present-object-id',
                nameSingular: 'person',
                namePlural: 'people',
              },
            },
            {
              type: RelationType.MANY_TO_ONE,
              targetObjectMetadata: {
                id: 'missing-object-id',
                nameSingular: 'conversation',
                namePlural: 'conversations',
              },
            },
          ],
        },
      ],
      depth: 1,
    });

    expect(result).toEqual({
      targetPerson: { id: true },
      targetPersonId: true,
    });
    expect(reportMissingRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: 'target',
      missingTargetNames: ['conversation'],
      relationFieldType: 'morph-relation',
    });
  });
});
