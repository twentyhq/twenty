import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getFieldOrThrow = (objectNameSingular: string, fieldName: string) => {
  const field = getMockObjectMetadataItemOrThrow(
    objectNameSingular,
  ).fields.find(({ name }) => name === fieldName);

  if (!isDefined(field)) {
    throw new Error(`${objectNameSingular}.${fieldName} not found`);
  }

  return field;
};

const SCOPE_VIEW = { id: '20202020-0000-4000-8000-000000000001' };

describe('isScopedRelationColumn', () => {
  it('is scoped by a scope view or a record limit on a one-to-many relation', () => {
    const fieldMetadataItem = getFieldOrThrow('company', 'people');

    expect(
      isScopedRelationColumn({
        fieldMetadataItem,
        recordField: { settings: null },
        scopeView: SCOPE_VIEW,
      }),
    ).toBe(true);
    expect(
      isScopedRelationColumn({
        fieldMetadataItem,
        recordField: { settings: { recordLimit: 1 } },
        scopeView: undefined,
      }),
    ).toBe(true);
  });

  it('is not scoped by a label alone', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: getFieldOrThrow('company', 'people'),
        recordField: { settings: { label: 'Next step' } },
        scopeView: undefined,
      }),
    ).toBe(false);
  });

  it('is never scoped on a many-to-one relation', () => {
    expect(
      isScopedRelationColumn({
        fieldMetadataItem: getFieldOrThrow('person', 'company'),
        recordField: { settings: { recordLimit: 1 } },
        scopeView: SCOPE_VIEW,
      }),
    ).toBe(false);
  });
});
