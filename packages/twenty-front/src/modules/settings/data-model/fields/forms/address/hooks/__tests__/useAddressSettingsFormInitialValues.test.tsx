import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { useAddressSettingsFormInitialValues } from '@/settings/data-model/fields/forms/address/hooks/useAddressSettingsFormInitialValues';

const ADDRESS_FIELD_ID = 'new-field';

const ALL_ADDRESS_SUB_FIELDS = [
  'addressStreet1',
  'addressStreet2',
  'addressCity',
  'addressState',
  'addressPostcode',
  'addressCountry',
];

type AddressFieldSettings = { subFields?: string[] | null } | null;

const renderAddressSettingsFormHook = ({
  objectMetadataItems = getTestEnrichedObjectMetadataItemsMock(),
  savedSettings,
}: {
  objectMetadataItems?: EnrichedObjectMetadataItem[];
  savedSettings?: AddressFieldSettings;
} = {}) => {
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    objectMetadataItems,
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const form = useForm({ defaultValues: { settings: savedSettings } });

    return (
      <MetadataWrapper>
        {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>{children}</FormProvider>
      </MetadataWrapper>
    );
  };

  return renderHook(
    () => {
      const { getValues, formState } = useFormContext();
      // The address form registers sub-fields through a Controller, and
      // react-hook-form ignores resets of unregistered fields.
      useController({ name: 'settings.subFields' });

      return {
        ...useAddressSettingsFormInitialValues({
          existingFieldMetadataId: ADDRESS_FIELD_ID,
        }),
        getValues,
        dirtyFields: formState.dirtyFields,
      };
    },
    { wrapper: Wrapper },
  );
};

describe('useAddressSettingsFormInitialValues', () => {
  it('should return all address subfields when no fieldMetadataItem is provided', () => {
    const { result } = renderAddressSettingsFormHook();

    expect(result.current.initialDisplaySubFields).toEqual(
      ALL_ADDRESS_SUB_FIELDS,
    );
  });

  it('should return all address subfields when fieldMetadataItem has no settings', () => {
    const { result } = renderAddressSettingsFormHook({
      objectMetadataItems: addNewAddressToMetadataItems(
        getTestEnrichedObjectMetadataItemsMock(),
        ADDRESS_FIELD_ID,
        null,
      ),
    });

    expect(result.current.initialDisplaySubFields).toEqual(
      ALL_ADDRESS_SUB_FIELDS,
    );
  });

  it('should return all address subfields when settings.subFields is null', () => {
    const { result } = renderAddressSettingsFormHook({
      objectMetadataItems: addNewAddressToMetadataItems(
        getTestEnrichedObjectMetadataItemsMock(),
        ADDRESS_FIELD_ID,
        { subFields: null },
      ),
    });

    expect(result.current.initialDisplaySubFields).toEqual(
      ALL_ADDRESS_SUB_FIELDS,
    );
  });

  it('should return all address subfields when settings.subFields is empty array', () => {
    const { result } = renderAddressSettingsFormHook({
      objectMetadataItems: addNewAddressToMetadataItems(
        getTestEnrichedObjectMetadataItemsMock(),
        ADDRESS_FIELD_ID,
        { subFields: [] },
      ),
    });

    expect(result.current.initialDisplaySubFields).toEqual(
      ALL_ADDRESS_SUB_FIELDS,
    );
  });

  it('should return configured subFields when they exist', () => {
    const { result } = renderAddressSettingsFormHook({
      objectMetadataItems: addNewAddressToMetadataItems(
        getTestEnrichedObjectMetadataItemsMock(),
        ADDRESS_FIELD_ID,
        { subFields: ['addressStreet1', 'addressCity', 'addressCountry'] },
      ),
    });

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressCity',
      'addressCountry',
    ]);
  });

  it('should select every subfield and mark it as changed when resetting to default', () => {
    const savedSettings = { subFields: ['addressPostcode'] };
    const { result } = renderAddressSettingsFormHook({
      objectMetadataItems: addNewAddressToMetadataItems(
        getTestEnrichedObjectMetadataItemsMock(),
        ADDRESS_FIELD_ID,
        savedSettings,
      ),
      savedSettings,
    });

    act(() => {
      result.current.resetSubFieldsToDefault();
    });

    expect(result.current.getValues('settings.subFields')).toEqual(
      ALL_ADDRESS_SUB_FIELDS,
    );
    expect(Object.keys(result.current.dirtyFields)).toContain('settings');
  });

  it('should handle partial subFields configuration', () => {
    const { result } = renderAddressSettingsFormHook({
      objectMetadataItems: addNewAddressToMetadataItems(
        getTestEnrichedObjectMetadataItemsMock(),
        ADDRESS_FIELD_ID,
        { subFields: ['addressStreet1', 'addressCity'] },
      ),
    });

    expect(result.current.initialDisplaySubFields).toEqual([
      'addressStreet1',
      'addressCity',
    ]);
  });
});

const addNewAddressToMetadataItems = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  fieldNameId: string,
  settings: AddressFieldSettings,
) => {
  return objectMetadataItems
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
        settings,
      };
      return { ...item, fields: [...fields, newField] };
    });
};
