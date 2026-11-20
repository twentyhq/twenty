import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

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
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(true);
  });

  it('is not scoped without a scope', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { isCanonical: false, relationScope: null },
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped on the canonical column of the field', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { relationScope: EMPTY_RELATION_SCOPE },
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped on a many-to-one relation', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: personCompanyField,
        recordField: SCOPED_RECORD_FIELD,
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is scoped on a relation to a join object with one target object', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
          fieldName: 'taskTargets',
        }),
        recordField: SCOPED_RECORD_FIELD,
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(true);
  });

  it('is never scoped on a relation to a join object with several target objects', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: getMockObjectMetadataItemOrThrow('task'),
          fieldName: 'taskTargets',
        }),
        recordField: SCOPED_RECORD_FIELD,
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped on a relation whose junction is invalid', () => {
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
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toBe(false);
  });

  it('is never scoped while lookup columns are disabled', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: SCOPED_RECORD_FIELD,
        objectMetadataItems,
        isLookupColumnsEnabled: false,
      }),
    ).toBe(false);
  });
});
