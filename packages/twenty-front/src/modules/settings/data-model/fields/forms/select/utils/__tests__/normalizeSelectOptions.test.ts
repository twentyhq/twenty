import { selectOptionsSchema } from '@/object-metadata/validation-schemas/selectOptionsSchema';
import { normalizeSelectOptions } from '@/settings/data-model/fields/forms/select/utils/normalizeSelectOptions';

describe('normalizeSelectOptions', () => {
  it.each([
    { description: 'missing', colorProperties: {} },
    { description: 'null', colorProperties: { color: null } },
    { description: 'invalid', colorProperties: { color: 'unsupported-color' } },
  ])(
    'allows editing an option when other options have $description colors',
    ({ colorProperties }) => {
      const options = [
        {
          id: 'first',
          label: 'First category',
          value: 'FIRST_CATEGORY',
          position: 0,
          ...colorProperties,
        },
        {
          id: 'second',
          label: 'Second category',
          value: 'SECOND_CATEGORY',
          position: 1,
          ...colorProperties,
        },
      ];

      const normalizedOptions = normalizeSelectOptions(options);
      const editedOptions = normalizedOptions.map((option, index) =>
        index === 0
          ? { ...option, label: 'Updated category', color: 'blue' }
          : option,
      );

      expect(normalizedOptions).toEqual(
        options.map((option) => ({ ...option, color: 'gray' })),
      );
      expect(selectOptionsSchema.parse(editedOptions)).toEqual(editedOptions);
    },
  );

  it('preserves existing colors and metadata while sorting without changing the input', () => {
    const firstOption = {
      id: 'first',
      label: 'First category',
      value: 'CUSTOM_FIRST_VALUE',
      position: 0,
      color: 'blue',
    };
    const secondOption = {
      id: 'second',
      label: 'Second category',
      value: 'SECOND_CATEGORY',
      position: 1,
      color: 'green',
    };
    const options = [secondOption, firstOption];

    expect(normalizeSelectOptions(options)).toEqual([
      firstOption,
      secondOption,
    ]);
    expect(options).toEqual([secondOption, firstOption]);
  });
});
