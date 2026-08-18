import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldWidgetNestedRelationCreateThrough } from '@/page-layout/widgets/field/utils/getFieldWidgetNestedRelationCreateThrough';
import { RelationType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const personOpportunitiesField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'pointOfContactForOpportunities',
);

const companyPeopleFieldRelationMetadata = {
  relationObjectMetadataNameSingular: 'person',
  targetFieldMetadataName: 'company',
  relationType: RelationType.ONE_TO_MANY,
} as FieldRelationMetadata;

describe('getFieldWidgetNestedRelationCreateThrough', () => {
  it('should scope pickable records to the current record and target the nested relation join column', () => {
    const createThrough = getFieldWidgetNestedRelationCreateThrough({
      fieldRelationMetadata: companyPeopleFieldRelationMetadata,
      nestedRelationFieldMetadataItem: personOpportunitiesField!,
      recordId: 'current-company-id',
    });

    expect(createThrough).toEqual({
      relationObjectMetadataNameSingular: 'person',
      relationRecordsFilter: { companyId: { eq: 'current-company-id' } },
      nestedRelationJoinColumnName: 'pointOfContactId',
    });
  });

  it('should return undefined for a many-to-one first hop', () => {
    // The intermediate is unambiguous there, so the created record's join
    // column is prefilled from the seeded direct filter instead of a picker.
    expect(
      getFieldWidgetNestedRelationCreateThrough({
        fieldRelationMetadata: {
          ...companyPeopleFieldRelationMetadata,
          relationType: RelationType.MANY_TO_ONE,
        },
        nestedRelationFieldMetadataItem: personOpportunitiesField!,
        recordId: 'current-company-id',
      }),
    ).toBeUndefined();
  });

  it('should return undefined without the relation inverse field name', () => {
    expect(
      getFieldWidgetNestedRelationCreateThrough({
        fieldRelationMetadata: {
          ...companyPeopleFieldRelationMetadata,
          targetFieldMetadataName: undefined,
        },
        nestedRelationFieldMetadataItem: personOpportunitiesField!,
        recordId: 'current-company-id',
      }),
    ).toBeUndefined();
  });

  it('should return undefined without a nested relation inverse field', () => {
    const personCompanyField = personObjectMetadataItem.fields.find(
      (field) => field.name === 'company',
    );

    expect(
      getFieldWidgetNestedRelationCreateThrough({
        fieldRelationMetadata: companyPeopleFieldRelationMetadata,
        nestedRelationFieldMetadataItem: {
          ...personCompanyField!,
          relation: null,
        },
        recordId: 'current-company-id',
      }),
    ).toBeUndefined();
  });
});
