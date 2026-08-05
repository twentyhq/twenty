import { resolveFieldWidgetNestedRelation } from '@/page-layout/widgets/field/utils/resolveFieldWidgetNestedRelation';
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

describe('resolveFieldWidgetNestedRelation', () => {
  it('should resolve a valid two-hop chain to the terminal object', () => {
    const resolved = resolveFieldWidgetNestedRelation({
      objectMetadataItems,
      relationTargetObjectMetadataId:
        companyPeopleField?.relation?.targetObjectMetadata.id,
      nestedRelationFieldMetadataId: personOpportunitiesField?.id,
    });

    expect(resolved).toBeDefined();
    expect(resolved?.nestedRelationFieldMetadataItem.id).toBe(
      personOpportunitiesField?.id,
    );
    expect(resolved?.nestedRelationTargetObjectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
  });

  it('should return undefined without a nested relation field id', () => {
    expect(
      resolveFieldWidgetNestedRelation({
        objectMetadataItems,
        relationTargetObjectMetadataId: personObjectMetadataItem.id,
        nestedRelationFieldMetadataId: null,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the nested field does not exist on the target object', () => {
    expect(
      resolveFieldWidgetNestedRelation({
        objectMetadataItems,
        relationTargetObjectMetadataId: personObjectMetadataItem.id,
        nestedRelationFieldMetadataId: 'deleted-field-id',
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the nested field is not a one-to-many relation', () => {
    const personCompanyField = personObjectMetadataItem.fields.find(
      (field) => field.name === 'company',
    );

    expect(
      resolveFieldWidgetNestedRelation({
        objectMetadataItems,
        relationTargetObjectMetadataId: personObjectMetadataItem.id,
        nestedRelationFieldMetadataId: personCompanyField?.id,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the target object cannot be found', () => {
    expect(
      resolveFieldWidgetNestedRelation({
        objectMetadataItems,
        relationTargetObjectMetadataId: 'unknown-object-id',
        nestedRelationFieldMetadataId: personOpportunitiesField?.id,
      }),
    ).toBeUndefined();
  });
});
