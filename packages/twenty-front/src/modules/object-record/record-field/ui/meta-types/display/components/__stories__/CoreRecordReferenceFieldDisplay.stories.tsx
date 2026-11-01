import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { CoreRecordReferenceFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/CoreRecordReferenceFieldDisplay';
import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';
const CORE_RECORD_ID = '20202020-0000-4000-8000-000000000002';

const CoreRecordName = ({ coreRecordId }: { coreRecordId: string }) => (
  <span>{`Core record ${coreRecordId}`}</span>
);

const COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD: CoreRecordReferenceField = {
  objectNameSingular: 'company',
  fieldName: 'owner',
  coreRecordIdFieldName: 'coreOwnerId',
  CoreRecordDisplay: CoreRecordName,
};

const renderCoreRecordReferenceField = (coreOwnerId: string | null) => {
  jotaiStore.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    __typename: 'Company',
    id: RECORD_ID,
    owner: null,
    coreOwnerId,
  });

  return (
    <FieldContext.Provider
      value={{
        recordId: RECORD_ID,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: true,
        fieldDefinition: {
          fieldMetadataId: 'owner-field-metadata-id',
          label: 'Owner',
          iconName: 'IconUser',
          type: FieldMetadataType.RELATION,
          metadata: {
            fieldName: 'owner',
            objectMetadataNameSingular: 'company',
          },
        },
      }}
    >
      <CoreRecordReferenceFieldDisplay
        coreRecordReferenceField={COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD}
      />
    </FieldContext.Provider>
  );
};

const meta: Meta<typeof CoreRecordReferenceFieldDisplay> = {
  title: 'UI/Data/Field/Display/CoreRecordReferenceFieldDisplay',
  component: CoreRecordReferenceFieldDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof CoreRecordReferenceFieldDisplay>;

export const WithCoreRecord: Story = {
  render: () => renderCoreRecordReferenceField(CORE_RECORD_ID),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(`Core record ${CORE_RECORD_ID}`),
    ).toBeVisible();
  },
};

export const WithoutCoreRecord: Story = {
  render: () => renderCoreRecordReferenceField(null),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText(/Core record/)).not.toBeInTheDocument();
  },
};
