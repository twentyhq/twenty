import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTitleCellSingleTextDisplayMode } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldDisplay';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const renderTitle = (title: string) => {
  jotaiStore.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    __typename: 'CalendarEvent',
    id: RECORD_ID,
    title,
  });

  return (
    <FieldContext.Provider
      value={{
        recordId: RECORD_ID,
        isLabelIdentifier: true,
        isRecordFieldReadOnly: false,
        fieldDefinition: {
          fieldMetadataId: 'title-field-metadata-id',
          label: 'Title',
          iconName: 'IconH1',
          type: FieldMetadataType.TEXT,
          metadata: {
            fieldName: 'title',
            objectMetadataNameSingular: 'calendarEvent',
          },
        },
      }}
    >
      <RecordTitleCellSingleTextDisplayMode
        containerType={RecordTitleCellContainerType.PageHeader}
      />
    </FieldContext.Provider>
  );
};

const meta: Meta<typeof RecordTitleCellSingleTextDisplayMode> = {
  title: 'Modules/ObjectRecord/RecordTitleCell/RecordTitleCellTextFieldDisplay',
  component: RecordTitleCellSingleTextDisplayMode,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof RecordTitleCellSingleTextDisplayMode>;

export const Default: Story = {
  render: () => renderTitle('Weekly sync'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Weekly sync')).toBeVisible();
  },
};

export const Restricted: Story = {
  render: () => renderTitle(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Not shared')).toBeVisible();
    await expect(
      canvas.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
  },
};
