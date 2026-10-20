import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { FileUploadProvider } from '@/file-upload/components/FileUploadProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import { ToastProvider } from 'twenty-ui/components/feedback';
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

jest.mock(
  '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile',
  () => ({
    useUploadFilesFieldFile: () => ({
      uploadFile: async (file: File) => ({
        fileId: `${file.name}-id`,
        label: file.name,
        extension: 'pdf',
        url: '',
      }),
    }),
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

const addressFieldMetadataItem = {
  id: 'address-field-id',
  name: 'address',
  label: 'Address',
  type: FieldMetadataType.ADDRESS,
} as unknown as FieldMetadataItem;

const fullNameFieldMetadataItem = {
  id: 'name-field-id',
  name: 'name',
  label: 'Name',
  type: FieldMetadataType.FULL_NAME,
} as unknown as FieldMetadataItem;

const emailsFieldMetadataItem = {
  id: 'emails-field-id',
  name: 'emails',
  label: 'Emails',
  type: FieldMetadataType.EMAILS,
} as unknown as FieldMetadataItem;

const singleEmailFieldMetadataItem = {
  ...emailsFieldMetadataItem,
  settings: { maxNumberOfValues: 1 },
} as unknown as FieldMetadataItem;

const linksFieldMetadataItem = {
  id: 'links-field-id',
  name: 'links',
  label: 'Links',
  type: FieldMetadataType.LINKS,
} as unknown as FieldMetadataItem;

const labeledLinksDraftRecord = {
  links: {
    primaryLinkUrl: 'https://twenty.com',
    primaryLinkLabel: 'Website',
    secondaryLinks: [{ url: 'https://docs.twenty.com', label: 'Docs' }],
  },
};

const phonesFieldMetadataItem = {
  id: 'phones-field-id',
  name: 'phones',
  label: 'Phones',
  type: FieldMetadataType.PHONES,
} as unknown as FieldMetadataItem;

const arrayFieldMetadataItem = {
  id: 'tags-field-id',
  name: 'tags',
  label: 'Tags',
  type: FieldMetadataType.ARRAY,
} as unknown as FieldMetadataItem;

const filesFieldMetadataItem = {
  id: 'documents-field-id',
  name: 'documents',
  label: 'Documents',
  type: FieldMetadataType.FILES,
} as unknown as FieldMetadataItem;

const wrappedTextFieldMetadataItem = {
  id: 'comments-field-id',
  name: 'comments',
  label: 'Comments',
  type: FieldMetadataType.TEXT,
  settings: { displayedMaxRows: 5 },
} as unknown as FieldMetadataItem;

const booleanFieldMetadataItem = {
  id: 'active-field-id',
  name: 'active',
  label: 'Active',
  type: FieldMetadataType.BOOLEAN,
} as unknown as FieldMetadataItem;

const renderInputs = ({
  fieldMetadataItem = currencyFieldMetadataItem,
  fieldMetadataItems = [fieldMetadataItem],
  initialDraftRecord = {},
  invalidFieldMetadataIdsToShow = [],
}: {
  fieldMetadataItem?: FieldMetadataItem;
  fieldMetadataItems?: FieldMetadataItem[];
  initialDraftRecord?: Partial<ObjectRecord>;
  invalidFieldMetadataIdsToShow?: string[];
} = {}) => {
  const onFieldValueChange = jest.fn();
  const onFieldValueClear = jest.fn();
  const onFieldValidityChange = jest.fn();
  const store = createStore();

  const Form = () => {
    const [draftRecord, setDraftRecord] =
      useState<Partial<ObjectRecord>>(initialDraftRecord);

    return (
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={fieldMetadataItems}
        draftRecord={draftRecord}
        invalidFieldMetadataIdsToShow={invalidFieldMetadataIdsToShow}
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
        <ToastProvider>
          <FileUploadProvider>
            <Form />
          </FileUploadProvider>
        </ToastProvider>
      </Provider>
    </I18nProvider>,
  );

  return { onFieldValueChange, onFieldValueClear, onFieldValidityChange };
};

describe('RecordFormFieldInputs with real inputs', () => {
  beforeAll(() => {
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
    Element.prototype.scrollIntoView = jest.fn();
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

  it('switches a boolean with the arrow keys without logging an error', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error');
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: booleanFieldMetadataItem,
    });

    await user.click(screen.getByRole('radio', { name: 'True' }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'False' })).toBeChecked();
    expect(onFieldValueChange).toHaveBeenLastCalledWith('active', false);
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('RadioGroup'),
    );

    consoleErrorSpy.mockRestore();
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

  it('keeps the focus in the street input when the address details are toggled', async () => {
    const user = userEvent.setup();
    renderInputs({ fieldMetadataItem: addressFieldMetadataItem });

    const streetInput = screen.getByRole('combobox', { name: 'Address' });

    await user.click(streetInput);
    await user.click(screen.getByRole('button', { name: 'Address details' }));

    expect(streetInput).toHaveFocus();
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

  it('splits a full name typed in one input', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: fullNameFieldMetadataItem,
    });

    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Jean de la Fontaine',
    );

    expect(onFieldValueChange).toHaveBeenLastCalledWith('name', {
      firstName: 'Jean',
      lastName: 'de la Fontaine',
    });

    await user.click(screen.getByRole('button', { name: 'Name details' }));

    expect(screen.getByRole('textbox', { name: 'First name' })).toHaveValue(
      'Jean',
    );
  });

  it('takes several lines in a text field that wraps', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: wrappedTextFieldMetadataItem,
    });

    await user.type(
      screen.getByRole('textbox', { name: 'Comments' }),
      'First line{Enter}Second line',
    );

    expect(onFieldValueChange).toHaveBeenLastCalledWith(
      'comments',
      'First line\nSecond line',
    );
  });

  it('saves an email typed in an empty emails field, then adds another', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: emailsFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox'), 'lea@northwind.io');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });

    await user.keyboard('{Enter}');

    expect(screen.getByText('lea@northwind.io')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.queryByText('Add Email')).not.toBeInTheDocument();

    await user.keyboard('lea.martin@gmail.com{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: ['lea.martin@gmail.com'],
    });
    expect(screen.getByText('lea.martin@gmail.com')).toBeInTheDocument();
  });

  it('adds a typed email with the add button and keeps an input for the next one', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: emailsFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox'), 'lea@northwind.io');
    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
    expect(screen.getByText('lea@northwind.io')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('moves to the next field with Tab and keeps the typed email', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItems: [
        emailsFieldMetadataItem,
        wrappedTextFieldMetadataItem,
      ],
    });

    const emailInput = screen.getAllByRole('textbox')[0];

    await user.type(emailInput, 'lea@northwind.io');
    await user.tab();

    expect(screen.getByRole('textbox', { name: 'Comments' })).toHaveFocus();
    expect(emailInput).toHaveValue('lea@northwind.io');
    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
  });

  it('shows an input under existing emails instead of an add button', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: emailsFieldMetadataItem,
      initialDraftRecord: {
        emails: { primaryEmail: 'lea@northwind.io', additionalEmails: [] },
      },
    });

    expect(screen.queryByText('Add Email')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveFocus();

    await user.type(screen.getByRole('textbox'), 'lea.martin@gmail.com{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: ['lea.martin@gmail.com'],
    });
  });

  it('reports an email being typed as invalid until it is complete', async () => {
    const user = userEvent.setup();
    const { onFieldValidityChange } = renderInputs({
      fieldMetadataItem: emailsFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox'), 'lea@');

    expect(onFieldValidityChange).toHaveBeenLastCalledWith(
      emailsFieldMetadataItem.id,
      false,
    );

    await user.type(screen.getByRole('textbox'), 'northwind.io');

    expect(onFieldValidityChange).toHaveBeenLastCalledWith(
      emailsFieldMetadataItem.id,
      true,
    );
  });

  it('shows why a flagged email field is invalid', () => {
    renderInputs({
      fieldMetadataItem: emailsFieldMetadataItem,
      invalidFieldMetadataIdsToShow: [emailsFieldMetadataItem.id],
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  });

  it('restores the previous values when a new email is cancelled with Escape', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: emailsFieldMetadataItem,
      initialDraftRecord: {
        emails: { primaryEmail: 'lea@northwind.io', additionalEmails: [] },
      },
    });

    await user.type(screen.getByRole('textbox'), 'draft@northwind.io');
    await user.keyboard('{Escape}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('keeps a single email field as an input after Enter', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: singleEmailFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox'), 'lea@northwind.io{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
    expect(screen.getByRole('textbox')).toHaveValue('lea@northwind.io');
    expect(
      screen.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  });

  it('edits the URL and the label of a link together', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: linksFieldMetadataItem,
      initialDraftRecord: labeledLinksDraftRecord,
    });

    await user.click(
      screen.getAllByRole('button', { name: 'More options' })[0],
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

    const urlInput = screen.getByLabelText('URL');
    const labelInput = screen.getByLabelText('Label');

    expect(urlInput).toHaveFocus();
    expect(urlInput).toHaveValue('https://twenty.com');
    expect(labelInput).toHaveValue('Website');

    await user.clear(labelInput);
    await user.type(labelInput, 'Home');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('links', {
      primaryLinkUrl: 'https://twenty.com',
      primaryLinkLabel: 'Home',
      secondaryLinks: [{ url: 'https://docs.twenty.com', label: 'Docs' }],
    });

    await user.clear(urlInput);
    await user.type(urlInput, 'https://twenty.com/pricing');
    await user.click(screen.getByRole('button', { name: 'Save item' }));

    expect(onFieldValueChange).toHaveBeenLastCalledWith('links', {
      primaryLinkUrl: 'https://twenty.com/pricing',
      primaryLinkLabel: 'Home',
      secondaryLinks: [{ url: 'https://docs.twenty.com', label: 'Docs' }],
    });
    expect(screen.queryByLabelText('Label')).not.toBeInTheDocument();
  });

  it('keeps the label of a link whose URL is retyped', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: linksFieldMetadataItem,
      initialDraftRecord: labeledLinksDraftRecord,
    });

    await user.click(
      screen.getAllByRole('button', { name: 'More options' })[0],
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

    const urlInput = screen.getByDisplayValue('https://twenty.com');

    await user.clear(urlInput);
    await user.type(urlInput, 'https://twenty.com/pricing{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('links', {
      primaryLinkUrl: 'https://twenty.com/pricing',
      primaryLinkLabel: 'Website',
      secondaryLinks: [{ url: 'https://docs.twenty.com', label: 'Docs' }],
    });
  });

  it('edits one link at a time', async () => {
    const user = userEvent.setup();
    renderInputs({
      fieldMetadataItem: linksFieldMetadataItem,
      initialDraftRecord: labeledLinksDraftRecord,
    });

    await user.click(
      screen.getAllByRole('button', { name: 'More options' })[0],
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

    expect(screen.getByLabelText('Label')).toHaveValue('Docs');
    expect(
      screen.getByDisplayValue('https://docs.twenty.com'),
    ).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue('https://twenty.com'),
    ).not.toBeInTheDocument();
  });

  it('collects several values in an array field', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: arrayFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox'), 'Shopify{Enter}');
    await user.type(screen.getByRole('textbox'), 'Klaviyo{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('tags', [
      'Shopify',
      'Klaviyo',
    ]);
  });

  it('edits the second of two identical array values', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: arrayFieldMetadataItem,
      initialDraftRecord: { tags: ['Shopify', 'Shopify'] },
    });

    await user.click(
      screen.getAllByRole('button', { name: 'More options' })[1],
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'Klaviyo{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('tags', [
      'Shopify',
      'Klaviyo',
    ]);
  });

  it('sets the value being edited apart with a line above and below', async () => {
    const user = userEvent.setup();
    renderInputs({
      fieldMetadataItem: arrayFieldMetadataItem,
      initialDraftRecord: { tags: ['Shopify', 'Klaviyo', 'Stripe'] },
    });

    await user.click(
      screen.getAllByRole('button', { name: 'More options' })[1],
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

    const separators = screen.getAllByRole('separator');
    const input = screen.getByDisplayValue('Klaviyo');

    expect(separators).toHaveLength(2);
    expect(separators[0].compareDocumentPosition(input)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(separators[1].compareDocumentPosition(input)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
  });

  it('saves a phone number typed digit by digit', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: phonesFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox'), '+33612345678');

    expect(onFieldValueChange).toHaveBeenLastCalledWith(
      'phones',
      expect.objectContaining({
        primaryPhoneNumber: '612345678',
        primaryPhoneCountryCode: 'FR',
        primaryPhoneCallingCode: '+33',
      }),
    );
  });

  it('offers to upload files in an empty files field', () => {
    renderInputs({ fieldMetadataItem: filesFieldMetadataItem });

    expect(screen.getByText('Upload file')).toBeInTheDocument();
  });

  it('adds a file dropped on the files field', async () => {
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: filesFieldMetadataItem,
    });

    const file = new File(['contract'], 'Contract 2026.pdf', {
      type: 'application/pdf',
    });

    fireEvent.drop(screen.getByText('Upload file'), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    await waitFor(() =>
      expect(onFieldValueChange).toHaveBeenLastCalledWith('documents', [
        expect.objectContaining({
          fileId: 'Contract 2026.pdf-id',
          label: 'Contract 2026.pdf',
        }),
      ]),
    );
  });

  it('uploads the files picked from the upload button', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: filesFieldMetadataItem,
    });

    await user.click(screen.getByText('Upload file'));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.change(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      {
        target: {
          files: [
            new File(['brief'], 'Brief.pdf', { type: 'application/pdf' }),
          ],
        },
      },
    );

    await waitFor(() =>
      expect(onFieldValueChange).toHaveBeenLastCalledWith('documents', [
        expect.objectContaining({ label: 'Brief.pdf' }),
      ]),
    );
  });

  it('keeps a file dropped while another file is being renamed', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: filesFieldMetadataItem,
      initialDraftRecord: {
        documents: [{ fileId: 'brief-id', label: 'Brief.pdf' }],
      },
    });

    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    await user.type(screen.getByRole('textbox'), ' v2');

    fireEvent.drop(screen.getByText('Upload file'), {
      dataTransfer: {
        files: [new File(['contract'], 'Contract.pdf')],
        types: ['Files'],
      },
    });

    await waitFor(() =>
      expect(onFieldValueChange).toHaveBeenLastCalledWith('documents', [
        expect.objectContaining({ label: 'Brief.pdf v2' }),
        expect.objectContaining({ label: 'Contract.pdf' }),
      ]),
    );

    await user.keyboard('{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('documents', [
      expect.objectContaining({ label: 'Brief.pdf v2' }),
      expect.objectContaining({ label: 'Contract.pdf' }),
    ]);
  });

  it('renames a file after its name is cleared and retyped', async () => {
    const user = userEvent.setup();
    const { onFieldValueChange } = renderInputs({
      fieldMetadataItem: filesFieldMetadataItem,
      initialDraftRecord: {
        documents: [
          { fileId: 'brief-id', label: 'Brief.pdf' },
          { fileId: 'contract-id', label: 'Contract.pdf' },
        ],
      },
    });

    await user.click(
      screen.getAllByRole('button', { name: 'More options' })[0],
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'Plan.pdf{Enter}');

    expect(onFieldValueChange).toHaveBeenLastCalledWith('documents', [
      expect.objectContaining({ fileId: 'brief-id', label: 'Plan.pdf' }),
      expect.objectContaining({ fileId: 'contract-id', label: 'Contract.pdf' }),
    ]);
  });

  it('reports a percentage that is not a number as invalid', async () => {
    const user = userEvent.setup();
    const { onFieldValidityChange } = renderInputs({
      fieldMetadataItem: percentageFieldMetadataItem,
    });

    await user.type(screen.getByRole('textbox', { name: 'Rate' }), 'abc');

    expect(onFieldValidityChange).toHaveBeenLastCalledWith(
      percentageFieldMetadataItem.id,
      false,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');
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
