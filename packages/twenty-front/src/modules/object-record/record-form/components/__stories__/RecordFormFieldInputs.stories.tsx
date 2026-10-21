import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type JsonValue } from 'type-fest';
import { ComponentDecorator } from 'twenty-ui/testing';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const fieldMetadataItems: FieldMetadataItem[] = [
  {
    ...getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName: 'employees',
    }),
    name: 'conversionRate',
    label: 'Conversion rate',
    settings: { type: 'percentage' },
  },
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName: 'idealCustomerProfile',
  }),
];

const RecordFormFieldInputsWithDraft = () => {
  const [draftRecord, setDraftRecord] = useState<Partial<ObjectRecord>>({});

  const writeDraft = (gqlFieldName: string, value: JsonValue) =>
    setDraftRecord((previousDraftRecord) => ({
      ...previousDraftRecord,
      [gqlFieldName]: value,
    }));

  return (
    <div style={{ width: 340 }}>
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={fieldMetadataItems}
        draftRecord={draftRecord}
        onFieldValueChange={writeDraft}
        onFieldValueClear={(gqlFieldName) => writeDraft(gqlFieldName, null)}
      />
    </div>
  );
};

const meta: Meta<typeof RecordFormFieldInputsWithDraft> = {
  title: 'Modules/ObjectRecord/RecordForm/RecordFormFieldInputs',
  component: RecordFormFieldInputsWithDraft,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof RecordFormFieldInputsWithDraft>;

export const PercentageAndBoolean: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const percentageInput = canvas.getByRole('textbox', {
      name: 'Conversion rate',
    });
    await userEvent.type(percentageInput, '25%');

    await expect(percentageInput).toHaveValue('25');
    await expect(canvas.getByText('%')).toBeVisible();

    await expect(canvas.getByRole('radio', { name: 'False' })).toBeChecked();

    await userEvent.click(canvas.getByRole('radio', { name: 'True' }));

    await expect(canvas.getByRole('radio', { name: 'True' })).toBeChecked();
  },
};
