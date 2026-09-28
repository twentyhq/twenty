import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  SettingsDataModelFieldAddressForm,
  type SettingsDataModelFieldTextFormValues,
} from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const ADDRESS_FIELD_ID = 'company-address-field';

const SAVED_SUB_FIELDS = ['addressPostcode' as const];

const ALL_ADDRESS_SUB_FIELDS = [
  'addressStreet1',
  'addressStreet2',
  'addressCity',
  'addressState',
  'addressPostcode',
  'addressCountry',
];

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().map(
  (objectMetadataItem) =>
    objectMetadataItem.nameSingular === 'company'
      ? {
          ...objectMetadataItem,
          fields: objectMetadataItem.fields.map((field) =>
            field.name === 'address'
              ? {
                  ...field,
                  id: ADDRESS_FIELD_ID,
                  settings: { subFields: SAVED_SUB_FIELDS },
                }
              : field,
          ),
        }
      : objectMetadataItem,
);

const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  objectMetadataItems,
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <MetadataWrapper>{children}</MetadataWrapper>
  </I18nProvider>
);

const handleSave = jest.fn();

const AddressFieldEditForm = () => {
  const formConfig = useForm<SettingsDataModelFieldTextFormValues>({
    defaultValues: { settings: { subFields: SAVED_SUB_FIELDS } },
  });

  // Mirrors SettingsObjectFieldEdit, which enables Save on isDirty and then
  // sends only the dirty fields.
  const { isDirty } = formConfig.formState;

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsDataModelFieldAddressForm
        existingFieldMetadataId={ADDRESS_FIELD_ID}
      />
      <button
        type="button"
        disabled={!isDirty}
        onClick={formConfig.handleSubmit((formValues) =>
          handleSave(formValues, Object.keys(formConfig.formState.dirtyFields)),
        )}
      >
        Save
      </button>
    </FormProvider>
  );
};

describe('SettingsDataModelFieldAddressForm', () => {
  it('saves every sub-field after resetting sub-fields to default', async () => {
    const user = userEvent.setup();
    render(<AddressFieldEditForm />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'Select address fields' }),
    );
    await user.click(screen.getByRole('button', { name: 'Reset to default' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(handleSave).toHaveBeenCalledTimes(1));
    const [savedFormValues, changedFieldNames] = handleSave.mock.calls[0];
    expect(changedFieldNames).toContain('settings');
    expect(savedFormValues.settings.subFields).toEqual(ALL_ADDRESS_SUB_FIELDS);
  });
});
