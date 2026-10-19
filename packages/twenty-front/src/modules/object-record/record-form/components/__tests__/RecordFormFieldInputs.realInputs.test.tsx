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

jest.mock('@/geo-map/hooks/useGetPlaceApiData', () => ({
  useGetPlaceApiData: () => ({
    getPlaceAutocompleteData: jest.fn().mockResolvedValue([]),
    getPlaceDetailsData: jest.fn(),
  }),
}));

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

const percentageFieldMetadataItem = {
  id: 'rate-field-id',
  name: 'rate',
  label: 'Rate',
  type: FieldMetadataType.NUMBER,
  settings: { type: 'percentage' },
} as unknown as FieldMetadataItem;

const addressFieldMetadataItem = {
  id: 'address-field-id',
  name: 'address',
  label: 'Address',
  type: FieldMetadataType.ADDRESS,
} as unknown as FieldMetadataItem;

const booleanFieldMetadataItem = {
  id: 'active-field-id',
  name: 'active',
  label: 'Active',
  type: FieldMetadataType.BOOLEAN,
} as unknown as FieldMetadataItem;

const renderInputs = ({
  fieldMetadataItem = currencyFieldMetadataItem,
  initialDraftRecord = {},
}: {
  fieldMetadataItem?: FieldMetadataItem;
  initialDraftRecord?: Partial<ObjectRecord>;
} = {}) => {
  const onFieldValueChange = jest.fn();
  const onFieldValueClear = jest.fn();
  const store = createStore();

  const Form = () => {
    const [draftRecord, setDraftRecord] =
      useState<Partial<ObjectRecord>>(initialDraftRecord);

    return (
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={[fieldMetadataItem]}
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

describe('RecordFormFieldInputs with real inputs', () => {
  beforeAll(() => {
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  });

  it('leaves a boolean without a default unset without changing the draft', () => {
    const { onFieldValueChange, onFieldValueClear } = renderInputs({
      fieldMetadataItem: booleanFieldMetadataItem,
    });

    expect(
      screen.getByRole('radiogroup', { name: 'Active' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'True' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'False' })).not.toBeChecked();
    expect(onFieldValueChange).not.toHaveBeenCalled();
    expect(onFieldValueClear).not.toHaveBeenCalled();
  });

  it('pre-selects a false boolean default without changing the draft', () => {
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: { ...booleanFieldMetadataItem, defaultValue: false },
    });

    expect(screen.getByRole('radio', { name: 'False' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'True' })).not.toBeChecked();
    expect(onFieldValueChange).not.toHaveBeenCalled();
  });

  it('stores the boolean the user picks', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: booleanFieldMetadataItem,
    });

    await user.click(screen.getByRole('radio', { name: 'False' }));

    expect(screen.getByRole('radio', { name: 'False' })).toBeChecked();
    expect(onFieldValueChange).toHaveBeenLastCalledWith('active', false);
  });

  it('pre-fills the metadata default currency', () => {
    renderInputs();

    expect(
      screen.getByRole('button', { name: 'Currency: USD' }),
    ).toBeInTheDocument();
  });

  it('keeps the default when an amount is typed without touching the currency', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs();

    await user.type(screen.getByRole('textbox'), '3.21');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('amount', {
      currencyCode: CurrencyCode.USD,
      amountMicros: 3_210_000,
    });
  });

  it('shows a stored percentage in percentage points', () => {
    renderInputs({
      fieldMetadataItem: percentageFieldMetadataItem,
      initialDraftRecord: { rate: 0.25 },
    });

    expect(screen.getByRole('textbox', { name: 'Rate' })).toHaveValue('25');
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('asks for a percentage instead of showing the number example', () => {
    renderInputs({ fieldMetadataItem: percentageFieldMetadataItem });

    expect(screen.getByPlaceholderText('Enter a number')).toBeInTheDocument();
  });

  it('keeps percentage decimals while typing and stores the fraction, then clears it', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: percentageFieldMetadataItem,
    });
    const input = screen.getByRole('textbox', { name: 'Rate' });

    await user.type(input, '25.5');

    expect(input).toHaveValue('25.5');
    expect(onFieldValueChange).toHaveBeenLastCalledWith('rate', 0.255);

    await user.clear(input);

    expect(input).toHaveValue('');
    expect(onFieldValueChange).toHaveBeenLastCalledWith('rate', null);
  });

  it('shows the street first and the other address fields on demand', async () => {
    const user = userEvent.setup();
    renderInputs({ fieldMetadataItem: addressFieldMetadataItem });

    expect(
      screen.getByRole('combobox', { name: 'Address' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'City' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Address details' }));

    expect(screen.getByRole('combobox', { name: 'City' })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Post Code' }),
    ).toBeInTheDocument();
  });

  it('saves the street typed in the address input', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: addressFieldMetadataItem,
    });

    await user.type(
      screen.getByRole('combobox', { name: 'Address' }),
      '12 Rue de Rivoli',
    );

    expect(onFieldValueChange).toHaveBeenLastCalledWith(
      'address',
      expect.objectContaining({ addressStreet1: '12 Rue de Rivoli' }),
    );
  });

  it('accepts a pasted percentage without duplicating the suffix', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: percentageFieldMetadataItem,
    });
    const input = screen.getByRole('textbox', { name: 'Rate' });

    await user.click(input);
    await user.paste('25%');

    expect(input).toHaveValue('25');
    expect(onFieldValueChange).toHaveBeenLastCalledWith('rate', 0.25);
  });
});
