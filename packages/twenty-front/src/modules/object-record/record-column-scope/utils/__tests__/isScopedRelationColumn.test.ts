import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyPeopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'people',
});

const personCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
  fieldName: 'company',
});

const EMPTY_RELATION_SCOPE = { filters: [], filterGroups: [], sorts: [] };

const SCOPED_RECORD_FIELD = {
  isCanonical: false,
  relationScope: EMPTY_RELATION_SCOPE,
};

describe('isScopedRelationColumn', () => {
  it('is an added column with a scope on a one-to-many relation', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: SCOPED_RECORD_FIELD,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(true);
  });

  it('is not scoped without a scope', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { isCanonical: false, relationScope: null },
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped on the canonical column of the field', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { relationScope: EMPTY_RELATION_SCOPE },
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped on a many-to-one relation', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: personCompanyField,
        recordField: SCOPED_RECORD_FIELD,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped on a relation that goes through a junction', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: {
          ...companyPeopleField,
          settings: {
            ...companyPeopleField.settings,
            junctionTargetFieldId: '20202020-0000-4000-8000-0000000000d1',
          },
        },
        recordField: SCOPED_RECORD_FIELD,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped while lookup columns are disabled', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: SCOPED_RECORD_FIELD,
        isLookupColumnsEnabled: false,
      }),
    ).toBe(false);
  });
});
