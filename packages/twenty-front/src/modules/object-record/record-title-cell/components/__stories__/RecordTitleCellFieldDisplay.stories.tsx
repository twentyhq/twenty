import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTitleCellFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellFieldDisplay';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const renderTitle = ({
  title,
  isForbidden,
}: {
  title: string;
  isForbidden: boolean;
}) => {
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
        isRecordFieldReadOnly: isForbidden,
        isForbidden,
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
      <RecordTitleCellFieldDisplay
        containerType={RecordTitleCellContainerType.PageHeader}
      />
    </FieldContext.Provider>
  );
};

const meta: Meta<typeof RecordTitleCellFieldDisplay> = {
  title: 'Modules/ObjectRecord/RecordTitleCell/RecordTitleCellFieldDisplay',
  component: RecordTitleCellFieldDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof RecordTitleCellFieldDisplay>;

export const Default: Story = {
  render: () => renderTitle({ title: 'Weekly sync', isForbidden: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Weekly sync')).toBeVisible();
  },
};

export const Restricted: Story = {
  render: () => renderTitle({ title: 'Weekly sync', isForbidden: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Not shared')).toBeVisible();
    await expect(canvas.queryByText('Weekly sync')).not.toBeInTheDocument();
  },
};
