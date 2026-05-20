import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { reportMissingMorphRelationTargetMetadata } from '@/object-record/graphql/record-gql-fields/utils/reportMissingMorphRelationTargetMetadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/reportMissingMorphRelationTargetMetadata',
  () => ({
    reportMissingMorphRelationTargetMetadata: jest.fn(),
  }),
);

describe('generateDepthRecordGqlFieldsFromFields', () => {
  it('should skip morph relations whose target object metadata is missing', () => {
    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems: [
        {
          id: 'company-id',
          fields: [],
          labelIdentifierFieldMetadataId: null,
          imageIdentifierFieldMetadataId: null,
          nameSingular: 'company',
          namePlural: 'companies',
        },
      ],
      fields: [
        {
          id: 'field-id',
          name: 'company',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
          relation: null,
          morphRelations: [
            {
              type: RelationType.MANY_TO_ONE,
              targetObjectMetadata: {
                id: 'company-id',
                nameSingular: 'company',
                namePlural: 'companies',
              },
            },
            {
              type: RelationType.MANY_TO_ONE,
              targetObjectMetadata: {
                id: 'oem-plant-id',
                nameSingular: 'oemPlant',
                namePlural: 'oemPlants',
              },
            },
          ],
        },
      ],
      depth: 1,
    });

    expect(result).toEqual({
      companyCompany: { id: true },
      companyCompanyId: true,
    });

    expect(reportMissingMorphRelationTargetMetadata).toHaveBeenCalledWith({
      fieldMetadataName: 'company',
      missingMorphTargetNames: ['oemPlant'],
    });
  });
});
