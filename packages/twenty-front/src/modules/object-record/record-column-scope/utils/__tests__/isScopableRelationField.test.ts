import { isScopableRelationField } from '@/object-record/record-column-scope/utils/isScopableRelationField';
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

describe('isScopableRelationField', () => {
  it('accepts a one-to-many relation', () => {
    expect(isScopableRelationField(getFieldOrThrow('company', 'people'))).toBe(
      true,
    );
  });

  it('rejects a many-to-one relation and a non-relation field', () => {
    expect(isScopableRelationField(getFieldOrThrow('person', 'company'))).toBe(
      false,
    );
    expect(isScopableRelationField(getFieldOrThrow('company', 'name'))).toBe(
      false,
    );
  });

  it('rejects a one-to-many relation through a junction object', () => {
    const peopleField = getFieldOrThrow('company', 'people');

    expect(
      isScopableRelationField({
        ...peopleField,
        settings: {
          ...peopleField.settings,
          junctionTargetFieldId: '20202020-0000-4000-8000-000000000001',
        },
      }),
    ).toBe(false);
  });
});
