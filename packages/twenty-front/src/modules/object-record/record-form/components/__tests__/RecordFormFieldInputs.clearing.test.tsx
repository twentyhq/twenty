import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import { type JsonValue } from 'type-fest';
import { FieldMetadataType } from '~/generated-metadata/graphql';

jest.mock(
  '@/object-record/record-field/ui/form-types/components/VariableChipStandalone',
  () => ({
    VariableChipStandalone: ({
      rawVariableName,
    }: {
      rawVariableName: string;
    }) => <span>{rawVariableName}</span>,
  }),
);

// The rich text inputs pull in BlockNote, which jest cannot load; they are
// never rendered for a currency field.
jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormRecordRichTextFieldInput',
  () => ({
    FormRecordRichTextFieldInput: () => null,
  }),
);

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormRichTextFieldInput',
  () => ({
    FormRichTextFieldInput: () => null,
  }),
);

const currencyFieldMetadataItem = {
  id: 'amount-field-id',
  name: 'amount',
  label: 'Amount',
  type: FieldMetadataType.CURRENCY,
  defaultValue: { amountMicros: null, currencyCode: "'USD'" },
} as unknown as FieldMetadataItem;

const objectMetadataItem = {
  id: 'opportunity-object-id',
  nameSingular: 'opportunity',
} as unknown as EnrichedObjectMetadataItem;

const renderInputs = () => {
  const onFieldValueChange = jest.fn();
  const onFieldValueClear = jest.fn();
  const store = createStore();

  // Mirrors how the record creation form keeps the draft: a change writes the
  // value under the field name, a clear writes null.
  const Form = () => {
    const [draftRecord, setDraftRecord] = useState<Partial<ObjectRecord>>({});

    return (
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={[currencyFieldMetadataItem]}
        draftRecord={draftRecord}
        onFieldValueChange={(gqlFieldName: string, value: JsonValue) => {
          onFieldValueChange(gqlFieldName, value);
          setDraftRecord((previousDraftRecord) => ({
            ...previousDraftRecord,
            [gqlFieldName]: value,
          }));
        }}
        onFieldValueClear={(gqlFieldName: string) => {
          onFieldValueClear(gqlFieldName);
          setDraftRecord((previousDraftRecord) => ({
            ...previousDraftRecord,
            [gqlFieldName]: null,
          }));
        }}
      />
    );
  };

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <Form />
      </Provider>
    </I18nProvider>,
  );

  return { onFieldValueChange, onFieldValueClear };
};

describe('RecordFormFieldInputs with the real currency input', () => {
  it('pre-fills the metadata default currency', () => {
    renderInputs();

    expect(screen.getByText(/\(USD\)/)).toBeInTheDocument();
  });

  it('does not resurrect the default after the user clears the currency', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange, onFieldValueClear } = renderInputs();

    await user.click(screen.getByText(/\(USD\)/));
    await user.click(await screen.findByText('No currency'));

    // Clearing is a change carrying the emptied composite value, not a clear.
    expect(onFieldValueChange).toHaveBeenCalledWith('amount', {
      currencyCode: null,
      amountMicros: null,
    });
    expect(onFieldValueClear).not.toHaveBeenCalled();

    expect(screen.queryByText(/\(USD\)/)).not.toBeInTheDocument();
    expect(screen.getByText('No currency')).toBeInTheDocument();
  });

  it('keeps the currency cleared when an amount is typed after clearing', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs();

    await user.click(screen.getByText(/\(USD\)/));
    await user.click(await screen.findByText('No currency'));
    await user.type(screen.getByRole('textbox'), '25');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('amount', {
      currencyCode: null,
      amountMicros: 25_000_000,
    });
    expect(screen.queryByText(/\(USD\)/)).not.toBeInTheDocument();
  });

  it('keeps the default when an amount is typed without touching the currency', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs();

    await user.type(screen.getByRole('textbox'), '3.21');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('amount', {
      currencyCode: CurrencyCode.USD,
      amountMicros: 3_210_000,
    });
    expect(screen.getByText(/\(USD\)/)).toBeInTheDocument();
  });
});
