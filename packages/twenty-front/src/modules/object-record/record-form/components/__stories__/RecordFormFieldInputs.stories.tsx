import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, http, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CurrencyCode } from 'twenty-shared/constants';
import { type JsonValue } from 'type-fest';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const percentageFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName: 'employees',
  }),
  name: 'conversionRate',
  label: 'Conversion rate',
  settings: { type: 'percentage' },
};

const booleanFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName: 'idealCustomerProfile',
  }),
  name: 'active',
  label: 'Active',
  defaultValue: null,
};

const currencyFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: opportunityObjectMetadataItem,
    fieldName: 'amount',
  }),
  defaultValue: { amountMicros: null, currencyCode: "'USD'" },
};

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const emailsFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: personObjectMetadataItem,
    fieldName: 'emails',
  }),
  label: 'Emails',
  settings: null,
};

const tagsFieldMetadataItem: FieldMetadataItem = {
  ...emailsFieldMetadataItem,
  id: 'tags-field-metadata-id',
  name: 'tags',
  label: 'Tags',
  type: FieldMetadataType.ARRAY,
  defaultValue: null,
};

const phonesFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: personObjectMetadataItem,
    fieldName: 'phones',
  }),
  label: 'Phones',
  settings: null,
  defaultValue: null,
};

const linkedinFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: personObjectMetadataItem,
    fieldName: 'linkedinLink',
  }),
  label: 'Linkedin',
  settings: null,
};

const filesFieldMetadataItem: FieldMetadataItem = {
  ...emailsFieldMetadataItem,
  id: 'files-field-metadata-id',
  name: 'attachments',
  label: 'Attachments',
  type: FieldMetadataType.FILES,
  defaultValue: null,
};

const nameFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: personObjectMetadataItem,
    fieldName: 'name',
  }),
  label: 'Name',
};

const addressFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName: 'address',
  }),
  label: 'Address',
  settings: null,
};

const taglineFieldMetadataItem: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName: 'tagline',
  }),
  label: 'Tagline',
  settings: { displayedMaxRows: 3 },
};

type RecordFormFieldInputsWithDraftProps = {
  fieldMetadataItems: FieldMetadataItem[];
  initialDraftRecord?: Partial<ObjectRecord>;
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
};

const RecordFormFieldInputsWithDraft = ({
  fieldMetadataItems,
  initialDraftRecord = {},
  onFieldValueChange,
}: RecordFormFieldInputsWithDraftProps) => {
  const [draftRecord, setDraftRecord] =
    useState<Partial<ObjectRecord>>(initialDraftRecord);

  const writeDraft = ({
    gqlFieldName,
    value,
  }: {
    gqlFieldName: string;
    value: JsonValue;
  }) => {
    onFieldValueChange(gqlFieldName, value);
    setDraftRecord((previousDraftRecord) => ({
      ...previousDraftRecord,
      [gqlFieldName]: value,
    }));
  };

  return (
    <RecordFormFieldInputs
      objectMetadataItem={companyObjectMetadataItem}
      fieldMetadataItems={fieldMetadataItems}
      formInstanceId="record-form-story"
      draftRecord={draftRecord}
      onFieldValueChange={(gqlFieldName, value) =>
        writeDraft({ gqlFieldName, value })
      }
      onFieldValueClear={(gqlFieldName) =>
        writeDraft({ gqlFieldName, value: null })
      }
    />
  );
};

const meta: Meta<typeof RecordFormFieldInputsWithDraft> = {
  title: 'Modules/ObjectRecord/RecordForm/RecordFormFieldInputs',
  component: RecordFormFieldInputsWithDraft,
  decorators: [ComponentDecorator, ToastDecorator],
  args: {
    fieldMetadataItems: [percentageFieldMetadataItem, booleanFieldMetadataItem],
    onFieldValueChange: fn(),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('GetAutoCompleteAddress', () =>
          HttpResponse.json({
            data: {
              getAutoCompleteAddress: [
                { text: '10 Rue de Rivoli, Paris', placeId: 'rivoli' },
              ],
            },
          }),
        ),
        graphql.query('GetAddressDetails', () =>
          HttpResponse.json({
            data: {
              getAddressDetails: {
                street: '10 Rue de Rivoli',
                state: 'Île-de-France',
                postcode: '75001',
                city: 'Paris',
                country: 'FR',
                location: { lat: 48.8566, lng: 2.3522 },
              },
            },
          }),
        ),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecordFormFieldInputsWithDraft>;

export const Percentage: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Conversion rate' });

    await expect(canvas.getByText('%')).toBeVisible();

    await userEvent.type(input, '25.5');

    await expect(input).toHaveValue('25.5');
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'conversionRate',
      0.255,
    );

    await userEvent.clear(input);

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'conversionRate',
      null,
    );

    await userEvent.paste('25%');

    await expect(input).toHaveValue('25');
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'conversionRate',
      0.25,
    );
  },
};

export const InvalidPercentage: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Conversion rate' });

    await userEvent.type(input, 'abc');

    await expect(canvas.getByRole('alert')).toHaveTextContent('Invalid number');
    await expect(args.onFieldValueChange).not.toHaveBeenCalled();

    await userEvent.clear(input);
    await userEvent.type(input, '12');

    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'conversionRate',
      0.12,
    );
  },
};

export const TrueFalse: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trueOption = canvas.getByRole('radio', { name: 'True' });
    const falseOption = canvas.getByRole('radio', { name: 'False' });

    await expect(
      canvas.getByRole('radiogroup', { name: 'Active' }),
    ).toBeVisible();
    await expect(trueOption).not.toBeChecked();
    await expect(falseOption).not.toBeChecked();
    await expect(args.onFieldValueChange).not.toHaveBeenCalled();

    await userEvent.click(falseOption);

    await expect(falseOption).toBeChecked();
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'active',
      false,
    );

    await userEvent.keyboard('{ArrowLeft}');

    await expect(trueOption).toBeChecked();
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'active',
      true,
    );
  },
};

export const StoredValues: Story = {
  args: {
    fieldMetadataItems: [
      percentageFieldMetadataItem,
      { ...booleanFieldMetadataItem, defaultValue: false },
    ],
    initialDraftRecord: { conversionRate: 0.25 },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Conversion rate' }),
    ).toHaveValue('25');
    await expect(canvas.getByRole('radio', { name: 'False' })).toBeChecked();
    await expect(args.onFieldValueChange).not.toHaveBeenCalled();
  },
};

export const Currency: Story = {
  args: {
    fieldMetadataItems: [currencyFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Amount' });

    await expect(
      canvas.getByRole('button', { name: 'Currency: USD' }),
    ).toBeVisible();

    await userEvent.type(input, '3.21');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('amount', {
      currencyCode: CurrencyCode.USD,
      amountMicros: 3_210_000,
    });

    await userEvent.clear(input);
    await userEvent.type(input, 'abc');

    await expect(canvas.getByRole('alert')).toHaveTextContent('Invalid number');
  },
};

export const Emails: Story = {
  args: {
    fieldMetadataItems: [emailsFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'lea@northwind.io');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });

    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByText('lea@northwind.io')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toHaveValue('');
    await expect(canvas.getByRole('textbox')).toHaveFocus();

    await userEvent.keyboard('lea.martin@gmail.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Add item' }));

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: ['lea.martin@gmail.com'],
    });
    await expect(canvas.getByText('lea.martin@gmail.com')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toHaveFocus();
    await expect(canvas.queryByText('Add Email')).not.toBeInTheDocument();
  },
};

export const EmailsCancelWithEscape: Story = {
  args: {
    fieldMetadataItems: [emailsFieldMetadataItem],
    initialDraftRecord: {
      emails: { primaryEmail: 'lea@northwind.io', additionalEmails: [] },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(canvas.getByText('lea@northwind.io')).toBeVisible();
    await expect(input).not.toHaveFocus();

    await userEvent.type(input, 'draft@northwind.io');
    await userEvent.keyboard('{Escape}');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
    await expect(input).toHaveValue('');
  },
};

export const InvalidEmail: Story = {
  args: {
    fieldMetadataItems: [emailsFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'lea@');

    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: '',
      additionalEmails: [],
    });
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a valid email',
    );

    await userEvent.type(input, 'northwind.io');

    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
  },
};

export const InvalidEmailLeftUnsubmitted: Story = {
  args: {
    fieldMetadataItems: [emailsFieldMetadataItem],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'lea@');
    await userEvent.tab();

    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a valid email',
    );

    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');

    await expect(input).toHaveValue('');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const SingleEmail: Story = {
  args: {
    fieldMetadataItems: [
      { ...emailsFieldMetadataItem, settings: { maxNumberOfValues: 1 } },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'lea@northwind.io{Enter}');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('emails', {
      primaryEmail: 'lea@northwind.io',
      additionalEmails: [],
    });
    await expect(input).toHaveValue('lea@northwind.io');
    await expect(
      canvas.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  },
};

export const ArrayValues: Story = {
  args: {
    fieldMetadataItems: [tagsFieldMetadataItem],
    initialDraftRecord: { tags: ['Shopify', 'Shopify', 'Stripe'] },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(
      canvas.getByPlaceholderText('Enter value'),
      'Klaviyo{Enter}',
    );

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('tags', [
      'Shopify',
      'Shopify',
      'Stripe',
      'Klaviyo',
    ]);

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'More options' })[1],
    );
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));

    const editedInput = await canvas.findByDisplayValue('Shopify');

    await waitFor(() => expect(editedInput).toHaveFocus());
    await expect(canvas.getAllByRole('separator')).toHaveLength(2);

    await userEvent.clear(editedInput);
    await userEvent.type(editedInput, 'HubSpot{Enter}');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('tags', [
      'Shopify',
      'HubSpot',
      'Stripe',
      'Klaviyo',
    ]);
  },
};

export const ArrayRowActionAfterClearedEdit: Story = {
  args: {
    fieldMetadataItems: [tagsFieldMetadataItem],
    initialDraftRecord: { tags: ['Shopify', 'Klaviyo', 'Stripe'] },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'More options' })[1],
    );
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));
    await userEvent.clear(await canvas.findByDisplayValue('Klaviyo'));

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'More options' })[1],
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Delete' }),
    );

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('tags', [
      'Shopify',
    ]);
    await expect(canvas.getByText('Shopify')).toBeVisible();
    await expect(canvas.queryByText('Stripe')).not.toBeInTheDocument();
  },
};

export const StoredListValues: Story = {
  args: {
    fieldMetadataItems: [emailsFieldMetadataItem, tagsFieldMetadataItem],
    initialDraftRecord: {
      emails: {
        primaryEmail: 'lea@northwind.io',
        additionalEmails: ['lea.martin@gmail.com'],
      },
      tags: ['Shopify', 'Stripe'],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('lea@northwind.io')).toBeVisible();
    await expect(canvas.getByText('lea.martin@gmail.com')).toBeVisible();
    await expect(canvas.getByText('Shopify')).toBeVisible();
    await expect(canvas.getByText('Stripe')).toBeVisible();
    await expect(args.onFieldValueChange).not.toHaveBeenCalled();
  },
};

export const Phones: Story = {
  args: {
    fieldMetadataItems: [phonesFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, '+33612345678');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('phones', {
      primaryPhoneNumber: '612345678',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [],
    });

    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByText('+33 6 12 34 56 78')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toHaveValue('');
    await expect(canvas.getByRole('textbox')).toHaveFocus();
  },
};

export const InvalidPhone: Story = {
  args: {
    fieldMetadataItems: [phonesFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), '+331{Enter}');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('phones', {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: [],
    });
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a valid phone number',
    );
  },
};

export const LinksLabelEdit: Story = {
  args: {
    fieldMetadataItems: [linkedinFieldMetadataItem],
    initialDraftRecord: {
      linkedinLink: {
        primaryLinkUrl: 'https://linkedin.com/in/lea',
        primaryLinkLabel: null,
        secondaryLinks: [],
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));

    await userEvent.type(
      await canvas.findByRole('textbox', { name: 'Label' }),
      'Lea Martin',
    );

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'linkedinLink',
      {
        primaryLinkUrl: 'https://linkedin.com/in/lea',
        primaryLinkLabel: 'Lea Martin',
        secondaryLinks: [],
      },
    );

    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByText('Lea Martin')).toBeVisible();
    await expect(
      canvas.queryByRole('textbox', { name: 'Label' }),
    ).not.toBeInTheDocument();
  },
};

export const InvalidLink: Story = {
  args: {
    fieldMetadataItems: [linkedinFieldMetadataItem],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'not a url');
    await userEvent.tab();

    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a valid URL',
    );
  },
};

export const FilesDropUpload: Story = {
  args: {
    fieldMetadataItems: [filesFieldMetadataItem],
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('CreateFileUpload', () =>
          HttpResponse.json({
            data: {
              createFileUpload: {
                __typename: 'FileUploadTarget',
                fileId: 'dropped-file-id',
                uploadUrl: 'https://upload.example.com/dropped-file-id',
                contentType: 'application/pdf',
              },
            },
          }),
        ),
        http.put(
          'https://upload.example.com/dropped-file-id',
          () => new HttpResponse(null, { status: 200 }),
        ),
        graphql.mutation('CompleteFileUpload', () =>
          HttpResponse.json({
            data: {
              completeFileUpload: {
                __typename: 'FileWithSignedUrl',
                id: 'dropped-file-id',
                path: 'files/brief.pdf',
                size: 4,
                createdAt: '2026-10-24T00:00:00.000Z',
                url: 'https://example.com/brief.pdf',
              },
            },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(
      new File(['test'], 'brief.pdf', { type: 'application/pdf' }),
    );

    canvas
      .getByRole('button', { name: 'Upload file' })
      .dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }));

    await waitFor(() =>
      expect(args.onFieldValueChange).toHaveBeenLastCalledWith('attachments', [
        expect.objectContaining({
          fileId: 'dropped-file-id',
          label: 'brief.pdf',
        }),
      ]),
    );
    await expect(await canvas.findByText('brief.pdf')).toBeVisible();
  },
};

export const FilesRenameAndDelete: Story = {
  args: {
    fieldMetadataItems: [filesFieldMetadataItem],
    initialDraftRecord: {
      attachments: [
        {
          fileId: 'deck-file-id',
          label: 'deck.pdf',
          extension: 'pdf',
          url: 'https://example.com/deck.pdf',
        },
        {
          fileId: 'notes-file-id',
          label: 'notes.txt',
          extension: 'txt',
          url: 'https://example.com/notes.txt',
        },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      canvas.getByRole('button', { name: 'Upload file' }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'More options' })[0],
    );
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));

    const labelInput = await canvas.findByDisplayValue('deck.pdf');

    await userEvent.clear(labelInput);

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'attachments',
      [
        expect.objectContaining({ label: 'deck.pdf' }),
        expect.objectContaining({ label: 'notes.txt' }),
      ],
    );

    await userEvent.type(labelInput, 'pitch.pdf{Enter}');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'attachments',
      [
        expect.objectContaining({ fileId: 'deck-file-id', label: 'pitch.pdf' }),
        expect.objectContaining({ fileId: 'notes-file-id' }),
      ],
    );
    await expect(canvas.getByText('pitch.pdf')).toBeVisible();

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'More options' })[1],
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Delete' }),
    );

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'attachments',
      [expect.objectContaining({ fileId: 'deck-file-id' })],
    );
    await expect(canvas.queryByText('notes.txt')).not.toBeInTheDocument();
  },
};

export const FullName: Story = {
  args: {
    fieldMetadataItems: [nameFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Name' }),
      'Jean de la Fontaine',
    );

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('name', {
      firstName: 'Jean',
      lastName: 'de la Fontaine',
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Name details' }));

    const firstNameInput = canvas.getByRole('textbox', { name: 'First name' });

    await expect(firstNameInput).toHaveValue('Jean');

    await userEvent.type(firstNameInput, ' Baptiste');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith('name', {
      firstName: 'Jean Baptiste',
      lastName: 'de la Fontaine',
    });
    await expect(canvas.getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Jean Baptiste de la Fontaine',
    );
  },
};

export const Address: Story = {
  args: {
    fieldMetadataItems: [addressFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('combobox', { name: 'City' }),
    ).not.toBeInTheDocument();

    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Address' }),
      '12 rue de Rivoli',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Address details' }),
    );
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'City' }),
      'Paris',
    );

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'address',
      expect.objectContaining({
        addressStreet1: '12 rue de Rivoli',
        addressCity: 'Paris',
      }),
    );
  },
};

export const StoredAddressShowsDetails: Story = {
  args: {
    fieldMetadataItems: [addressFieldMetadataItem],
    initialDraftRecord: {
      address: {
        addressStreet1: '12 rue de Rivoli',
        addressStreet2: '',
        addressCity: 'Paris',
        addressState: '',
        addressPostcode: '75001',
        addressCountry: 'France',
        addressLat: null,
        addressLng: null,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Address' })).toHaveValue(
      '12 rue de Rivoli',
    );
    await expect(canvas.getByRole('combobox', { name: 'City' })).toHaveValue(
      'Paris',
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Post Code' }),
    ).toHaveValue('75001');
    await expect(args.onFieldValueChange).not.toHaveBeenCalled();
  },
};

export const AddressSuggestions: Story = {
  args: {
    fieldMetadataItems: [addressFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Address' }),
      '10 Rue',
    );
    await userEvent.click(
      await screen.findByRole('option', { name: '10 Rue de Rivoli, Paris' }),
    );

    await waitFor(() =>
      expect(canvas.getByRole('combobox', { name: 'City' })).toHaveValue(
        'Paris',
      ),
    );
    await expect(canvas.getByRole('combobox', { name: 'Address' })).toHaveValue(
      '10 Rue de Rivoli',
    );
    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'address',
      expect.objectContaining({
        addressStreet1: '10 Rue de Rivoli',
        addressCity: 'Paris',
        addressPostcode: '75001',
        addressCountry: 'France',
      }),
    );
  },
};

export const WrappingText: Story = {
  args: {
    fieldMetadataItems: [taglineFieldMetadataItem],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textArea = canvas.getByRole('textbox', { name: 'Tagline' });

    await expect(textArea.tagName).toBe('TEXTAREA');

    await userEvent.type(textArea, 'Build{Enter}the CRM');

    await expect(args.onFieldValueChange).toHaveBeenLastCalledWith(
      'tagline',
      'Build\nthe CRM',
    );
  },
};
