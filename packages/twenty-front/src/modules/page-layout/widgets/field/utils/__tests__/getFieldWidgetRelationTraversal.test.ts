import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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

describe('getFieldWidgetRelationTraversal', () => {
  it('should scope a direct widget through the relation own inverse', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: companyPeopleField,
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
    });

    // The embedded view lists the terminal object...
    expect(traversal.targetObjectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
    // ...scoped by the second hop's inverse (opportunity -> person)...
    expect(traversal.inverseFieldMetadataId).toBe(
      personOpportunitiesField?.relation?.targetFieldMetadata.id,
    );
    // ...traversed one relation further out via the first hop's inverse
    // (person -> company), which is what makes it a two-hop filter.
    expect(traversal.relationTargetFieldMetadataId).toBe(
      companyPeopleField?.relation?.targetFieldMetadata.id,
    );
  });

  it('should not confuse the two hops', () => {
    const traversal = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: companyPeopleField,
      nestedRelationFieldMetadataItem: personOpportunitiesField,
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
    });

    expect(traversal.targetObjectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
    expect(traversal.inverseFieldMetadataId).toBe(
      companyOpportunitiesField?.relation?.targetFieldMetadata.id,
    );
    // The intermediate is the single record the current record points at, so
    // the seeded filter is a direct one on the terminal object.
    expect(traversal.relationTargetFieldMetadataId).toBeNull();
  });

  it('should return an empty traversal without a source field', () => {
    expect(
      getFieldWidgetRelationTraversal({ sourceFieldMetadataItem: undefined }),
    ).toEqual({
      targetObjectMetadataId: undefined,
      inverseFieldMetadataId: undefined,
      relationTargetFieldMetadataId: null,
    });
  });
});
