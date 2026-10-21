import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CurrencyCode } from 'twenty-shared/constants';
import { type JsonValue } from 'type-fest';
import { ComponentDecorator } from 'twenty-ui/testing';
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
  decorators: [ComponentDecorator],
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
