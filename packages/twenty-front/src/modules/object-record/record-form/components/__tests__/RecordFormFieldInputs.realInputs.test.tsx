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

const urlFieldMetadataItem = {
  id: 'website-field-id',
  name: 'website',
  label: 'Website',
  type: FieldMetadataType.LINKS,
  settings: { type: 'url' },
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

  it('stores an https URL when pasting a domain and preserves hidden link data', async () => {
    const user = userEvent.setup();
    const links = {
      primaryLinkLabel: 'Website label',
      primaryLinkUrl: '',
      secondaryLinks: [{ url: 'https://other.example.com', label: 'Other' }],
    };
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: urlFieldMetadataItem,
      initialDraftRecord: { website: links },
    });
    const input = screen.getByRole('textbox', { name: 'Website' });

    await user.click(input);
    await user.paste('example.com');

    expect(input).toHaveValue('example.com');
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(onFieldValueChange).toHaveBeenLastCalledWith('website', {
      ...links,
      primaryLinkUrl: 'https://example.com',
    });
  });

  it('preserves an existing HTTP protocol when editing and keeps an erased URL empty', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: urlFieldMetadataItem,
      initialDraftRecord: {
        website: {
          primaryLinkUrl: 'http://example.com',
          primaryLinkLabel: '',
          secondaryLinks: null,
        },
      },
    });
    const input = screen.getByRole('textbox', { name: 'Website' });

    expect(input).toHaveValue('example.com');
    expect(screen.getByText('http://')).toBeInTheDocument();

    await user.type(input, '/path');
    expect(onFieldValueChange).toHaveBeenLastCalledWith('website', {
      primaryLinkLabel: '',
      primaryLinkUrl: 'http://example.com/path',
      secondaryLinks: null,
    });

    await user.clear(input);
    expect(onFieldValueChange).toHaveBeenLastCalledWith('website', {
      primaryLinkLabel: '',
      primaryLinkUrl: '',
      secondaryLinks: null,
    });
  });

  it('moves a typed protocol into the prefix without saving a URL with no domain', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: urlFieldMetadataItem,
    });
    const input = screen.getByRole('textbox', { name: 'Website' });

    await user.type(input, 'http://');

    expect(input).toHaveValue('');
    expect(screen.getByText('http://')).toBeInTheDocument();
    expect(onFieldValueChange).toHaveBeenLastCalledWith('website', {
      primaryLinkLabel: '',
      primaryLinkUrl: '',
      secondaryLinks: null,
    });

    await user.type(input, 'example.com');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('website', {
      primaryLinkLabel: '',
      primaryLinkUrl: 'http://example.com',
      secondaryLinks: null,
    });
  });

  it('keeps domain fields on the existing input without a protocol prefix', () => {
    renderInputs({
      fieldMetadataItem: {
        ...urlFieldMetadataItem,
        settings: { type: 'domain' },
      },
      initialDraftRecord: {
        website: {
          primaryLinkUrl: 'example.com',
          primaryLinkLabel: '',
          secondaryLinks: null,
        },
      },
    });

    expect(screen.getByRole('textbox', { name: 'Website' })).toHaveTextContent(
      'example.com',
    );
    expect(screen.queryByText('https://')).not.toBeInTheDocument();
  });
});
