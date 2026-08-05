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
