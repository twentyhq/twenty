import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormFieldInput } from '@/object-record/record-form/components/RecordFormFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type JsonValue } from 'type-fest';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const domainSettings = { type: 'domain', maxNumberOfValues: 1 } as const;

const fields = [
  {
    label: 'Probability',
    type: FieldMetadataType.NUMBER,
    metadata: {
      fieldName: 'probability',
      placeHolder: '',
      settings: { type: 'percentage' },
    },
  },
  {
    label: 'Website',
    type: FieldMetadataType.LINKS,
    metadata: { fieldName: 'website' },
  },
  {
    label: 'Domain',
    type: FieldMetadataType.LINKS,
    metadata: { fieldName: 'domain', settings: domainSettings },
  },
  {
    label: 'Ideal customer profile',
    type: FieldMetadataType.BOOLEAN,
    metadata: { fieldName: 'idealCustomerProfile' },
  },
  {
    label: 'Active',
    type: FieldMetadataType.BOOLEAN,
    metadata: { fieldName: 'active' },
  },
  {
    label: 'Verified',
    type: FieldMetadataType.BOOLEAN,
    metadata: { fieldName: 'verified' },
  },
] as const satisfies Pick<
  FieldDefinition<FieldMetadata>,
  'label' | 'type' | 'metadata'
>[];

const RecordFormFieldInputWithState = ({
  readonly = false,
}: {
  readonly?: boolean;
}) => {
  const [draft, setDraft] = useState<
    Record<
      | 'probability'
      | 'website'
      | 'domain'
      | 'idealCustomerProfile'
      | 'active'
      | 'verified',
      JsonValue
    >
  >({
    probability: 0.25,
    website: {
      primaryLinkLabel: '',
      primaryLinkUrl: 'https://example.com',
      secondaryLinks: null,
    },
    domain: {
      primaryLinkLabel: '',
      primaryLinkUrl: 'example.com',
      secondaryLinks: null,
    },
    idealCustomerProfile: null,
    active: true,
    verified: false,
  });

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', width: 320 }}>
      {fields.map((field) => (
        <RecordFormFieldInput
          key={field.metadata.fieldName}
          field={field}
          defaultValue={draft[field.metadata.fieldName]}
          readonly={readonly}
          onChange={(value) =>
            setDraft((previousDraft) => ({
              ...previousDraft,
              [field.metadata.fieldName]: value,
            }))
          }
        />
      ))}
      <pre style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(draft, null, 2)}
      </pre>
    </div>
  );
};

const meta = {
  title: 'UI/Data/Field/Form/Input/RecordFormFieldInput',
  component: RecordFormFieldInputWithState,
} satisfies Meta<typeof RecordFormFieldInputWithState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { readonly: true } };
