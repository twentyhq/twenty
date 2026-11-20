import { getScopedRelationLookupTarget } from '@/object-record/record-column-scope/utils/getScopedRelationLookupTarget';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'people',
});
const emailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});
const companyNameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const EMPTY_RELATION_SCOPE = { filters: [], filterGroups: [], sorts: [] };

const getLookupTarget = (
  recordField: Parameters<
    typeof getScopedRelationLookupTarget
  >[0]['recordField'],
) =>
  getScopedRelationLookupTarget({
    recordField,
    fieldMetadataItem: peopleField,
    objectMetadataItems,
    isLookupColumnsEnabled: true,
  });

describe('getScopedRelationLookupTarget', () => {
  it('resolves the field of the related records a scoped column shows', () => {
    expect(
      getLookupTarget({
        isCanonical: false,
        relationScope: EMPTY_RELATION_SCOPE,
        relationTargetFieldMetadataId: emailsField.id,
      }),
    ).toMatchObject({
      relationFieldName: 'people',
      relationObjectMetadataItem: { id: personObjectMetadataItem.id },
      lookupTargetFieldMetadataItem: { id: emailsField.id },
      lookupTargetFieldDefinition: { metadata: { fieldName: 'emails' } },
    });
  });

  it('has no target on a scoped column that shows its records', () => {
    expect(
      getLookupTarget({
        isCanonical: false,
        relationScope: EMPTY_RELATION_SCOPE,
      }),
    ).toBeUndefined();
  });

  it('has no target on a column without a scope', () => {
    expect(
      getLookupTarget({
        isCanonical: false,
        relationScope: null,
        relationTargetFieldMetadataId: emailsField.id,
      }),
    ).toBeUndefined();
  });

  it('has no target for a field that is not on the related object', () => {
    expect(
      getLookupTarget({
        isCanonical: false,
        relationScope: EMPTY_RELATION_SCOPE,
        relationTargetFieldMetadataId: companyNameField.id,
      }),
    ).toBeUndefined();
  });
});
