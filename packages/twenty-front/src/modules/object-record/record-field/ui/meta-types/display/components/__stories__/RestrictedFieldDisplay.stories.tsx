import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const renderDescription = (description: string) => {
  jotaiStore.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    __typename: 'CalendarEvent',
    id: RECORD_ID,
    description,
  });

  return (
    <FieldContext.Provider
      value={{
        recordId: RECORD_ID,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: false,
        fieldDefinition: {
          fieldMetadataId: 'description-field-metadata-id',
          label: 'Description',
          iconName: 'IconFileDescription',
          type: FieldMetadataType.TEXT,
          metadata: {
            fieldName: 'description',
            objectMetadataNameSingular: 'calendarEvent',
          },
        },
      }}
    >
      <FieldDisplay />
    </FieldContext.Provider>
  );
};

const meta: Meta<typeof FieldDisplay> = {
  title: 'UI/Data/Field/Display/RestrictedFieldDisplay',
  component: FieldDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof FieldDisplay>;

export const Default: Story = {
  render: () => renderDescription('Quarterly planning with the team'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Quarterly planning with the team'),
    ).toBeVisible();
  },
};

export const Restricted: Story = {
  render: () =>
    renderDescription(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Not shared')).toBeVisible();
    await expect(
      canvas.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
  },
};
