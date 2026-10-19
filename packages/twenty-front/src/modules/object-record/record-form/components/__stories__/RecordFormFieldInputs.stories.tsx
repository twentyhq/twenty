import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type JsonValue } from 'type-fest';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const objectMetadataItem = {
  id: 'company-object-id',
  nameSingular: 'company',
} as unknown as EnrichedObjectMetadataItem;

const fieldMetadataItems = [
  {
    id: 'name-field-id',
    name: 'name',
    label: 'Name',
    type: FieldMetadataType.FULL_NAME,
  },
  {
    id: 'address-field-id',
    name: 'address',
    label: 'Address',
    type: FieldMetadataType.ADDRESS,
  },
] as unknown as FieldMetadataItem[];

const RecordFormFieldInputsWithDraft = ({
  initialDraftRecord,
}: {
  initialDraftRecord: Partial<ObjectRecord>;
}) => {
  const [draftRecord, setDraftRecord] =
    useState<Partial<ObjectRecord>>(initialDraftRecord);

  return (
    <div style={{ width: 400 }}>
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={fieldMetadataItems}
        draftRecord={draftRecord}
        onFieldValueChange={(gqlFieldName: string, value: JsonValue) =>
          setDraftRecord((previousDraftRecord) => ({
            ...previousDraftRecord,
            [gqlFieldName]: value,
          }))
        }
        onFieldValueClear={(gqlFieldName: string) =>
          setDraftRecord((previousDraftRecord) => ({
            ...previousDraftRecord,
            [gqlFieldName]: null,
          }))
        }
      />
    </div>
  );
};

const meta: Meta<typeof RecordFormFieldInputsWithDraft> = {
  title: 'Modules/ObjectRecord/RecordForm/RecordFormFieldInputs',
  component: RecordFormFieldInputsWithDraft,
  args: {
    initialDraftRecord: {
      name: { firstName: 'Mary Ann', lastName: 'Smith' },
      address: {
        addressStreet1: '12 Rue de Rivoli',
        addressStreet2: null,
        addressCity: 'Paris',
        addressState: 'Île-de-France',
        addressPostcode: '75004',
        addressCountry: 'France',
        addressLat: null,
        addressLng: null,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecordFormFieldInputsWithDraft>;

export const Default: Story = {};

export const AddressDetailsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Address details' }),
    );

    expect(await canvas.findByRole('combobox', { name: 'City' })).toHaveValue(
      'Paris',
    );
  },
};

export const NameDetailsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Name details' }),
    );

    expect(
      await canvas.findByRole('textbox', { name: 'First name' }),
    ).toHaveValue('Mary Ann');
  },
};
