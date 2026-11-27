import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { RelationWithUnloadedRecordCount } from '@/object-record/record-field/ui/meta-types/display/components/RelationWithUnloadedRecordCount';

const meta: Meta<typeof RelationWithUnloadedRecordCount> = {
  title: 'UI/Data/Field/Display/RelationWithUnloadedRecordCount',
  component: RelationWithUnloadedRecordCount,
  decorators: [ComponentDecorator],
  args: {
    children: <span>Loaded records</span>,
  },
};

export default meta;

type Story = StoryObj<typeof RelationWithUnloadedRecordCount>;

export const WithUnloadedRecords: Story = {
  args: { unloadedRecordCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Loaded records')).toBeVisible();
    expect(await canvas.findByText('+3')).toBeVisible();
  },
};

export const AllRecordsLoaded: Story = {
  args: { unloadedRecordCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Loaded records')).toBeVisible();
    expect(canvas.queryByText(/^\+/)).toBeNull();
  },
};
