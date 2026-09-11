import { renderHook } from '@testing-library/react';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { selectOptionsSchema } from '@/object-metadata/validation-schemas/selectOptionsSchema';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/object-metadata/hooks/useFieldMetadataItemById');
jest.mock('react-hook-form', () => ({
  useFormContext: () => ({ resetField: jest.fn() }),
}));

describe('useSelectSettingsFormInitialValues', () => {
  it.each([
    { description: 'missing', colorProperties: {} },
    { description: 'null', colorProperties: { color: null } },
    { description: 'invalid', colorProperties: { color: 'unsupported-color' } },
  ])(
    'allows editing an option when other options have $description colors',
    ({ colorProperties }) => {
      const fieldMetadataItem = {
        options: [
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
        ],
      };

      jest.mocked(useFieldMetadataItemById).mockReturnValue({
        fieldMetadataItem: fieldMetadataItem as FieldMetadataItem,
        objectMetadataItem: getTestEnrichedObjectMetadataItemsMock()[0],
      });

      const { result } = renderHook(() =>
        useSelectSettingsFormInitialValues({ fieldMetadataId: 'field-id' }),
      );
      const editedOptions = result.current.initialOptions.map((option, index) =>
        index === 0
          ? { ...option, label: 'Updated category', color: 'blue' }
          : option,
      );

      expect(result.current.initialOptions).toEqual(
        fieldMetadataItem.options.map((option) => ({
          ...option,
          color: 'gray',
        })),
      );
      expect(selectOptionsSchema.parse(editedOptions)).toEqual(editedOptions);
    },
  );

  it('preserves existing colors and metadata while sorting the options', () => {
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

    jest.mocked(useFieldMetadataItemById).mockReturnValue({
      fieldMetadataItem: { options } as FieldMetadataItem,
      objectMetadataItem: getTestEnrichedObjectMetadataItemsMock()[0],
    });

    const { result } = renderHook(() =>
      useSelectSettingsFormInitialValues({ fieldMetadataId: 'field-id' }),
    );

    expect(result.current.initialOptions).toEqual([firstOption, secondOption]);
    expect(options).toEqual([secondOption, firstOption]);
  });
});
