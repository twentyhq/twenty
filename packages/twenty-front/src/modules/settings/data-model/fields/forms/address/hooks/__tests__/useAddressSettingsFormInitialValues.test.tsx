import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { renderHook } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { useAddressSettingsFormInitialValues } from '@/settings/data-model/fields/forms/address/hooks/useAddressSettingsFormInitialValues';

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

const mockResetField = jest.fn();
const mockUseFormContext = useFormContext as jest.MockedFunction<
  typeof useFormContext
>;

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  objectMetadataItems: generatedMockObjectMetadataItems,
});

describe('useAddressSettingsFormInitialValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormContext.mockReturnValue({
      resetField: mockResetField,
    } as any);
  });

  it('should return all address subfields when no fieldMetadataItem is provided', () => {
    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ]);
  });

  it('should return all address subfields when fieldMetadataItem has no settings', () => {
    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ]);
  });

  it('should return all address subfields when settings.subFields is null', () => {
    // const fieldMetadataItem: Pick<FieldMetadataItem, 'settings'> = {
    //   settings: {
    //     subFields: null,
    //   },
    // };

    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ]);
  });

  it('should return all address subfields when settings.subFields is empty array', () => {
    // const fieldMetadataItem: Pick<FieldMetadataItem, 'settings'> = {
    //   settings: {
    //     subFields: [],
    //   },
    // };

    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ]);
  });

  it('should return configured subFields when they exist', () => {
    const newGeneratedMockObjectMetadataItems = addNewAddressToMetadataItems(
      generatedMockObjectMetadataItems,
      'new-field',
      ['addressStreet1', 'addressCity', 'addressCountry'],
    );

    const WrapperSpecific = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      objectMetadataItems: newGeneratedMockObjectMetadataItems,
    });

    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: WrapperSpecific,
      },
    );

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressCity',
      'addressCountry',
    ]);
  });

  it('should call resetField with all address subFields when resetDefaultValueField is called', () => {
    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: Wrapper,
      },
    );

    result.current.resetDefaultValueField();

    expect(mockResetField).toHaveBeenCalledWith('settings.subFields', {
      defaultValue: [
        'addressStreet1',
        'addressStreet2',
        'addressCity',
        'addressState',
        'addressPostcode',
        'addressCountry',
      ],
    });
  });

  it('should handle partial subFields configuration', () => {
    const WrapperSpecific = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      objectMetadataItems: addNewAddressToMetadataItems(
        generatedMockObjectMetadataItems,
        'new-field',
        ['addressStreet1', 'addressCity'],
      ),
    });
    const { result } = renderHook(
      () =>
        useAddressSettingsFormInitialValues({
          existingFieldMetadataId: 'new-field',
        }),
      {
        wrapper: WrapperSpecific,
      },
    );

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressCity',
    ]);
  });
});

const addNewAddressToMetadataItems = (
  generatedMockObjectMetadataItems: ObjectMetadataItem[],
  fieldNameId: string,
  subFields: string[],
) => {
  return generatedMockObjectMetadataItems
    .filter((item) => item.nameSingular === 'company')
    .map((item) => {
      const fields = item.fields;
      const addressField = fields.find(
        (field) => field.type === FieldMetadataType.ADDRESS,
      );
      if (!addressField) {
        throw new Error('Address field not found');
      }
      const newField = {
        ...addressField,
        id: fieldNameId,
        type: FieldMetadataType.ADDRESS,
        settings: { subFields },
      };
      return { ...item, fields: [...fields, newField] };
    });
};
