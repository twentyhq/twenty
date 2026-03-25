import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { Tag } from 'twenty-ui/components';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const meta: Meta<typeof ExpandableList> = {
  title: 'UI/Layout/ExpandableList/ExpandableList',
  component: ExpandableList,
  decorators: [
    (Story) => (
      <div style={{ padding: 4, width: 300 }}>
        <Story />
      </div>
    ),
    ComponentDecorator,
  ],
  args: {
    children: Array.from({ length: 7 }, (_, index) => (
      <Tag
        key={index}
        text={`Option ${index + 1}`}
        color={MAIN_COLOR_NAMES[index]}
      />
    )),
    isChipCountDisplayed: false,
  },
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const Default: Story = {};

export const WithChipCount: Story = {
  args: { isChipCountDisplayed: true },
};

export const WithExpandedList: Story = {
  ...WithChipCount,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const chipCount = await canvas.findByText(/^\+\d+$/);

    await userEvent.click(chipCount);

    const body = canvasElement.ownerDocument.body;
    const bodyCanvas = within(body);

    expect(await bodyCanvas.findByText('Option 7')).toBeDefined();
  },
};
