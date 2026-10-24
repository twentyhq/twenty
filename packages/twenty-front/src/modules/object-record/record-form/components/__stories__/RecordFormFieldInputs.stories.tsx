import { type Meta, type StoryObj } from '@storybook/react-vite';
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
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a valid email',
    );

    await userEvent.type(input, 'northwind.io');

    await expect(input).not.toHaveAttribute('aria-invalid');
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

    await expect(input).toHaveAttribute('aria-invalid', 'true');
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
