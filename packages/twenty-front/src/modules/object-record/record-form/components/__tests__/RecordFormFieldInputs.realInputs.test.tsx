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

// The rich text inputs pull in BlockNote, which jest cannot load.
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

const percentageFieldMetadataItem = {
  id: 'rate-field-id',
  name: 'rate',
  label: 'Rate',
  type: FieldMetadataType.NUMBER,
  settings: { type: 'percentage' },
} as unknown as FieldMetadataItem;

const booleanFieldMetadataItem = {
  id: 'active-field-id',
  name: 'active',
  label: 'Active',
  type: FieldMetadataType.BOOLEAN,
} as unknown as FieldMetadataItem;

const objectMetadataItem = {
  id: 'opportunity-object-id',
  nameSingular: 'opportunity',
} as unknown as EnrichedObjectMetadataItem;

const renderInputs = ({
  fieldMetadataItem = currencyFieldMetadataItem,
  initialDraftRecord = {},
}: {
  fieldMetadataItem?: FieldMetadataItem;
  initialDraftRecord?: Partial<ObjectRecord>;
} = {}) => {
  const onFieldValueChange = jest.fn();
  const onFieldValueClear = jest.fn();
  const onFieldValidityChange = jest.fn();
  const store = createStore();

  // Mirrors how the record creation form keeps the draft: a change writes the
  // value under the field name, a clear writes null.
  const Form = () => {
    const [draftRecord, setDraftRecord] =
      useState<Partial<ObjectRecord>>(initialDraftRecord);

    return (
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={[fieldMetadataItem]}
        draftRecord={draftRecord}
        onFieldValidityChange={onFieldValidityChange}
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

  return { onFieldValueChange, onFieldValueClear, onFieldValidityChange };
};

describe('RecordFormFieldInputs with real inputs', () => {
  beforeAll(() => {
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
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

  it('reports an amount that is not a number as invalid', async () => {
    const user = userEvent.setup();
    const { onFieldValidityChange } = renderInputs();

    await user.type(screen.getByRole('textbox'), 'abc');

    expect(onFieldValidityChange).toHaveBeenLastCalledWith({
      fieldMetadataId: currencyFieldMetadataItem.id,
      isValid: false,
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');
  });

  it('shows a stored percentage in percentage points', () => {
    renderInputs({
      fieldMetadataItem: percentageFieldMetadataItem,
      initialDraftRecord: { rate: 0.25 },
    });

    expect(screen.getByRole('textbox', { name: 'Rate' })).toHaveValue('25');
    expect(screen.getByText('%')).toBeInTheDocument();
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

  it('reports a percentage that is not a number as invalid until it is fixed', async () => {
    const user = userEvent.setup();
    const { onFieldValidityChange, onFieldValueChange } = renderInputs({
      fieldMetadataItem: percentageFieldMetadataItem,
    });
    const input = screen.getByRole('textbox', { name: 'Rate' });

    await user.type(input, 'abc');

    expect(onFieldValidityChange).toHaveBeenLastCalledWith({
      fieldMetadataId: percentageFieldMetadataItem.id,
      isValid: false,
    });
    expect(onFieldValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');

    await user.clear(input);
    await user.type(input, '12');

    expect(onFieldValidityChange).toHaveBeenLastCalledWith({
      fieldMetadataId: percentageFieldMetadataItem.id,
      isValid: true,
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onFieldValueChange).toHaveBeenLastCalledWith('rate', 0.12);
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

  it('switches a boolean with the arrow keys', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: booleanFieldMetadataItem,
    });

    await user.click(screen.getByRole('radio', { name: 'True' }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'False' })).toBeChecked();
    expect(onFieldValueChange).toHaveBeenLastCalledWith('active', false);
  });
});
