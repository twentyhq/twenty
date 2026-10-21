import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInput } from '@/object-record/record-form/components/RecordFormFieldInput';
import { type JsonValue } from 'type-fest';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const companyField = (fieldName: string) =>
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName,
  });

const asFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
): FieldMetadataItem => fieldMetadataItem;

type RecordFormFieldInputWithDraftProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem?: typeof companyObjectMetadataItem;
  initialValue?: JsonValue;
  onChange: (value: JsonValue) => void;
};

const RecordFormFieldInputWithDraft = ({
  fieldMetadataItem,
  objectMetadataItem = companyObjectMetadataItem,
  initialValue = null,
  onChange,
}: RecordFormFieldInputWithDraftProps) => {
  const [value, setValue] = useState<JsonValue>(initialValue);

  return (
    <div style={{ width: 340 }}>
      <RecordFormFieldInput
        field={formatFieldMetadataItemAsFieldDefinition({
          field: fieldMetadataItem,
          objectMetadataItem,
          showLabel: true,
        })}
        defaultValue={value}
        onChange={(newValue) => {
          onChange(newValue);
          setValue(newValue);
        }}
      />
    </div>
  );
};

const meta: Meta<typeof RecordFormFieldInputWithDraft> = {
  title: 'Modules/ObjectRecord/RecordForm/RecordFormFieldInput',
  component: RecordFormFieldInputWithDraft,
  decorators: [ComponentDecorator],
  args: { onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof RecordFormFieldInputWithDraft>;

export const TextField: Story = {
  args: { fieldMetadataItem: companyField('tagline') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Tagline' }),
      'Hi',
    );

    await expect(args.onChange).toHaveBeenLastCalledWith('Hi');
  },
};

export const NumberField: Story = {
  args: { fieldMetadataItem: companyField('employees') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Employees' });

    await userEvent.type(input, '12');

    await expect(args.onChange).toHaveBeenLastCalledWith(12);

    await userEvent.type(input, 'x');

    await expect(canvas.getByRole('alert')).toHaveTextContent('Invalid number');
  },
};

export const UuidField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'externalId',
      label: 'External id',
      type: FieldMetadataType.UUID,
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'External id' }),
      ' abc ',
    );

    await expect(args.onChange).toHaveBeenLastCalledWith('abc');
  },
};

export const SelectField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      isNullable: true,
      options: [
        {
          id: 'lead',
          label: 'Lead',
          value: 'LEAD',
          color: 'blue',
          position: 0,
        },
        { id: 'won', label: 'Won', value: 'WON', color: 'green', position: 1 },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('No Stage')).toBeVisible();
  },
};

export const MultiSelectField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'markets',
      label: 'Markets',
      type: FieldMetadataType.MULTI_SELECT,
      options: [
        { id: 'eu', label: 'Europe', value: 'EU', color: 'blue', position: 0 },
        { id: 'us', label: 'USA', value: 'US', color: 'green', position: 1 },
      ],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Markets' })).toBeVisible();
  },
};

export const DateField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'foundedOn',
      label: 'Founded on',
      type: FieldMetadataType.DATE,
    }),
    initialValue: '2024-03-12',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByDisplayValue(/2024/)).toBeVisible();
  },
};

export const DateTimeField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'nextMeetingAt',
      label: 'Next meeting',
      type: FieldMetadataType.DATE_TIME,
    }),
    initialValue: '2024-03-12T10:00:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByDisplayValue(/2024/)).toBeVisible();
  },
};

export const FullNameField: Story = {
  args: {
    fieldMetadataItem: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: personObjectMetadataItem,
      fieldName: 'name',
    }),
    objectMetadataItem: personObjectMetadataItem,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'First Name' }),
      'Ada',
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Last Name' }),
      'Lovelace',
    );

    await expect(args.onChange).toHaveBeenLastCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  },
};

export const AddressField: Story = {
  args: { fieldMetadataItem: companyField('address') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'City' }),
      'Paris',
    );

    await expect(args.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ addressCity: 'Paris' }),
    );
  },
};

export const ArrayField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'keywords',
      label: 'Keywords',
      type: FieldMetadataType.ARRAY,
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByPlaceholderText('Enter an item'),
      'crm{Enter}',
    );

    await expect(args.onChange).toHaveBeenLastCalledWith(['crm']);
  },
};

export const RawJsonField: Story = {
  args: {
    fieldMetadataItem: asFieldMetadataItem({
      ...companyField('tagline'),
      name: 'metadata',
      label: 'Metadata',
      type: FieldMetadataType.RAW_JSON,
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Metadata' }),
      '{{"a": 1}',
    );

    await expect(args.onChange).toHaveBeenLastCalledWith('{"a": 1}');
  },
};
