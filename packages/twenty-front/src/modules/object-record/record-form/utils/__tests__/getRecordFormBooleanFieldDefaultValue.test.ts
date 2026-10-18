import { getRecordFormBooleanFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormBooleanFieldDefaultValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getRecordFormBooleanFieldDefaultValue', () => {
  it.each([true, false])(
    'returns the %s default of a boolean field',
    (value) => {
      expect(
        getRecordFormBooleanFieldDefaultValue({
          type: FieldMetadataType.BOOLEAN,
          defaultValue: value,
        }),
      ).toBe(value);
    },
  );

  it('returns undefined when the boolean field has no default value', () => {
    expect(
      getRecordFormBooleanFieldDefaultValue({
        type: FieldMetadataType.BOOLEAN,
        defaultValue: null,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for non-boolean fields', () => {
    expect(
      getRecordFormBooleanFieldDefaultValue({
        type: FieldMetadataType.TEXT,
        defaultValue: true,
      }),
    ).toBeUndefined();
  });
});
