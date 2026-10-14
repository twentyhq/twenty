import { getTraversableRelationFieldMetadataItems } from '@/object-record/record-field/utils/relation-traversal/getTraversableRelationFieldMetadataItems';
import { getTraversedFieldCandidates } from '@/object-record/record-field/utils/relation-traversal/getTraversedFieldCandidates';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const opportunityCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'company',
});
const opportunityAmountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'amount',
});
const companyEmployeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'employees',
});
const companyPeopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'people',
});

describe('resolveRecordFieldRelationTraversal', () => {
  it('resolves the relation, target field and target object', () => {
    const relationTraversal = resolveRecordFieldRelationTraversal({
      recordField: {
        fieldMetadataItemId: opportunityCompanyField.id,
        relationTargetFieldMetadataItemId: companyEmployeesField.id,
      },
      sourceObjectMetadataItem: opportunityObjectMetadataItem,
      objectMetadataItems,
    });

    expect(relationTraversal?.relationFieldMetadataItem.id).toBe(
      opportunityCompanyField.id,
    );
    expect(relationTraversal?.targetFieldMetadataItem.id).toBe(
      companyEmployeesField.id,
    );
    expect(relationTraversal?.targetObjectMetadataItem.id).toBe(
      companyObjectMetadataItem.id,
    );
  });

  it('returns null for a plain record field', () => {
    expect(
      resolveRecordFieldRelationTraversal({
        recordField: { fieldMetadataItemId: opportunityCompanyField.id },
        sourceObjectMetadataItem: opportunityObjectMetadataItem,
        objectMetadataItems,
      }),
    ).toBeNull();
  });

  it('returns null when the source field is not a many-to-one relation', () => {
    expect(
      resolveRecordFieldRelationTraversal({
        recordField: {
          fieldMetadataItemId: opportunityAmountField.id,
          relationTargetFieldMetadataItemId: companyEmployeesField.id,
        },
        sourceObjectMetadataItem: opportunityObjectMetadataItem,
        objectMetadataItems,
      }),
    ).toBeNull();
  });

  it('returns null when the target field is not on the related object', () => {
    expect(
      resolveRecordFieldRelationTraversal({
        recordField: {
          fieldMetadataItemId: opportunityCompanyField.id,
          relationTargetFieldMetadataItemId: opportunityAmountField.id,
        },
        sourceObjectMetadataItem: opportunityObjectMetadataItem,
        objectMetadataItems,
      }),
    ).toBeNull();
  });
});

describe('getTraversableRelationFieldMetadataItems', () => {
  it('lists many-to-one relations of the object with their target object', () => {
    const traversableRelations = getTraversableRelationFieldMetadataItems({
      objectMetadataItem: opportunityObjectMetadataItem,
      objectMetadataItems,
    });

    const companyRelation = traversableRelations.find(
      (traversableRelation) =>
        traversableRelation.relationFieldMetadataItem.id ===
        opportunityCompanyField.id,
    );

    expect(companyRelation?.targetObjectMetadataItem.id).toBe(
      companyObjectMetadataItem.id,
    );
  });

  it('does not list one-to-many relations', () => {
    const traversableRelations = getTraversableRelationFieldMetadataItems({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
    });

    expect(
      traversableRelations.some(
        (traversableRelation) =>
          traversableRelation.relationFieldMetadataItem.id ===
          companyPeopleField.id,
      ),
    ).toBe(false);
  });
});

describe('getTraversedFieldCandidates', () => {
  it('builds one candidate per non-relation target field with a combined label', () => {
    const candidates = getTraversedFieldCandidates({
      relationFieldMetadataItem: opportunityCompanyField,
      targetObjectMetadataItem: companyObjectMetadataItem,
    });

    const employeesCandidate = candidates.find(
      (candidate) =>
        candidate.targetFieldMetadataItem.id === companyEmployeesField.id,
    );

    expect(employeesCandidate?.label).toBe(
      `${opportunityCompanyField.label} › ${companyEmployeesField.label}`,
    );
    expect(employeesCandidate?.recordField).toEqual({
      fieldMetadataItemId: opportunityCompanyField.id,
      relationTargetFieldMetadataItemId: companyEmployeesField.id,
    });
    expect(
      candidates.some(
        (candidate) =>
          candidate.targetFieldMetadataItem.id === companyPeopleField.id,
      ),
    ).toBe(false);
  });
});
