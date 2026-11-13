import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsObjectIndexFieldsForm } from '@/settings/data-model/indexes/forms/components/SettingsObjectIndexFieldsForm';
import { SettingsObjectIndexOptionsForm } from '@/settings/data-model/indexes/forms/components/SettingsObjectIndexOptionsForm';
import { type SettingsObjectNewIndexFormValues } from '@/settings/data-model/indexes/forms/validation-schemas/settingsObjectNewIndexFormSchema';
import {
  FieldMetadataType,
  IndexType,
  OrderByDirection,
} from '~/generated-metadata/graphql';

const OCCURRED_ON_FIELD_ID = '6a2831dc-ea0d-4dd4-965b-f559f902315a';
const SUMMARY_FIELD_ID = '80784c53-e420-4e28-b810-87bc45d74a47';

const indexableFields = [
  {
    id: OCCURRED_ON_FIELD_ID,
    name: 'occurredOn',
    label: 'Occurred On',
    type: FieldMetadataType.DATE,
    icon: 'IconCalendar',
  },
  {
    id: SUMMARY_FIELD_ID,
    name: 'summary',
    label: 'Summary',
    type: FieldMetadataType.TEXT,
    icon: 'IconAbc',
  },
] as FieldMetadataItem[];

const IndexForm = ({
  onSave,
}: {
  onSave: (formValues: SettingsObjectNewIndexFormValues) => void;
}) => {
  const formConfig = useForm<SettingsObjectNewIndexFormValues>({
    defaultValues: { fields: [], indexType: IndexType.BTREE },
  });

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsObjectIndexFieldsForm indexableFields={indexableFields} />
      <SettingsObjectIndexOptionsForm />
      <button type="button" onClick={formConfig.handleSubmit(onSave)}>
        Save
      </button>
    </FormProvider>
  );
};

const renderIndexForm = () => {
  const onSave = jest.fn();

  render(
    <JotaiProvider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <IndexForm onSave={onSave} />
      </I18nProvider>
    </JotaiProvider>,
  );

  return { onSave };
};

const pickField = async (fieldLabel: string) => {
  await userEvent.click(screen.getByText('Select a field'));
  await userEvent.click(await screen.findByText(fieldLabel));
};

describe('SettingsObjectIndexFieldsForm', () => {
  it('sorts a picked field ascending unless descending is chosen', async () => {
    const { onSave } = renderIndexForm();

    await pickField('Occurred On');
    await pickField('Summary');

    expect(screen.getAllByText('Ascending')).toHaveLength(2);

    await userEvent.click(screen.getAllByText('Ascending')[0]);
    await userEvent.click(await screen.findByText('Descending'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      {
        indexType: IndexType.BTREE,
        fields: [
          {
            fieldMetadataId: OCCURRED_ON_FIELD_ID,
            subFieldName: null,
            direction: OrderByDirection.DescNullsLast,
          },
          {
            fieldMetadataId: SUMMARY_FIELD_ID,
            subFieldName: null,
            direction: OrderByDirection.AscNullsLast,
          },
        ],
      },
      expect.anything(),
    );
  });

  it('keeps the direction when the field of a row changes', async () => {
    const { onSave } = renderIndexForm();

    await pickField('Occurred On');
    await userEvent.click(screen.getByText('Ascending'));
    await userEvent.click(await screen.findByText('Descending'));

    await userEvent.click(screen.getByText('Occurred On'));
    await userEvent.click(await screen.findByText('Summary'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: [
          {
            fieldMetadataId: SUMMARY_FIELD_ID,
            subFieldName: null,
            direction: OrderByDirection.DescNullsLast,
          },
        ],
      }),
      expect.anything(),
    );
  });

  it('hides the direction for index types that cannot sort', async () => {
    renderIndexForm();

    await pickField('Occurred On');
    expect(screen.getByText('Ascending')).toBeInTheDocument();

    await userEvent.click(
      screen.getByText('BTREE (default, good for sorting and equality)'),
    );
    await userEvent.click(
      await screen.findByText('GIN (full-text search and JSONB)'),
    );

    expect(screen.queryByText('Ascending')).not.toBeInTheDocument();
  });
});
