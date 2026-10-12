import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const companyPeopleField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'people',
);

const personOpportunitiesField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'pointOfContactForOpportunities',
);

const personCompanyField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'company',
);

const companyOpportunitiesField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'opportunities',
);

const personPreviousCompaniesField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'previousCompanies',
);

const companyPreviousEmployeesField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'previousEmployees',
);

const employmentHistoryObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('employmentHistory');

const employmentHistoryPersonField =
  employmentHistoryObjectMetadataItem.fields.find(
    (field) => field.name === 'person',
  );

describe('getFieldWidgetRelationTraversal', () => {
  it('should scope a direct widget through the relation own inverse', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: companyPeopleField,
      objectMetadataItems,
    });

    expect(traversal.targetObjectMetadataId).toBe(personObjectMetadataItem.id);
    expect(traversal.inverseFieldMetadataId).toBe(
      companyPeopleField?.relation?.targetFieldMetadata.id,
    );
    expect(traversal.relationTargetFieldMetadataId).toBeNull();
  });

  it('should scope a nested widget through the last hop, traversing the first', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: companyPeopleField,
      nestedRelationFieldMetadataItem: personOpportunitiesField,
      objectMetadataItems,
    });

    expect(traversal.targetObjectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
    expect(traversal.inverseFieldMetadataId).toBe(
      personOpportunitiesField?.relation?.targetFieldMetadata.id,
    );
    expect(traversal.relationTargetFieldMetadataId).toBe(
      companyPeopleField?.relation?.targetFieldMetadata.id,
    );
  });

  it('should not confuse the two hops', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: companyPeopleField,
      nestedRelationFieldMetadataItem: personOpportunitiesField,
      objectMetadataItems,
    });

    expect(traversal.inverseFieldMetadataId).not.toBe(
      traversal.relationTargetFieldMetadataId,
    );
    expect(traversal.targetObjectMetadataId).not.toBe(
      personObjectMetadataItem.id,
    );
  });

  it('should scope a many-to-one first hop directly, without traversal', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: personCompanyField,
      nestedRelationFieldMetadataItem: companyOpportunitiesField,
      objectMetadataItems,
    });

    expect(traversal.targetObjectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
    expect(traversal.inverseFieldMetadataId).toBe(
      companyOpportunitiesField?.relation?.targetFieldMetadata.id,
    );
    expect(traversal.relationTargetFieldMetadataId).toBeNull();
  });

  it('should scope a junction widget on the junction target, traversing the junction', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: personPreviousCompaniesField,
      objectMetadataItems,
    });

    expect(traversal.targetObjectMetadataId).toBe(companyObjectMetadataItem.id);
    expect(traversal.inverseFieldMetadataId).toBe(
      companyPreviousEmployeesField?.id,
    );
    expect(traversal.relationTargetFieldMetadataId).toBe(
      employmentHistoryPersonField?.id,
    );
  });

  it('should return an empty traversal without a source field', () => {
    expect(
      getFieldWidgetRelationTraversal({
        sourceFieldMetadataItem: undefined,
        objectMetadataItems,
      }),
    ).toEqual({
      targetObjectMetadataId: undefined,
      inverseFieldMetadataId: undefined,
      relationTargetFieldMetadataId: null,
    });
  });
});
