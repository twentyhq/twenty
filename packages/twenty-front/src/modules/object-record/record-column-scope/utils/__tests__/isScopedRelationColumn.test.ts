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

const SCOPE_VIEW = { id: '20202020-0000-4000-8000-000000000001' };

describe('isScopedRelationColumn', () => {
  it('is scoped by a scope view or a record limit on a one-to-many relation', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { settings: null },
        scopeView: SCOPE_VIEW,
      }),
    ).toBe(true);
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { settings: { recordLimit: 1 } },
        scopeView: undefined,
      }),
    ).toBe(true);
  });

  it('is not scoped by a label alone', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: companyPeopleField,
        recordField: { settings: { label: 'Next step' } },
        scopeView: undefined,
      }),
    ).toBe(false);
  });

  it('is never scoped on a many-to-one relation', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: personCompanyField,
        recordField: { settings: { recordLimit: 1 } },
        scopeView: SCOPE_VIEW,
      }),
    ).toBe(false);
  });
});
