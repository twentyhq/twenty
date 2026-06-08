import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

// Regression test for #12039: when the available width grows (e.g. a table
// column is widened), the list must recompute and reveal as many chips as fit,
// instead of staying stuck on the count measured at the initial (narrow) width.
const ResizableExpandableListWrapper = () => {
  const [width, setWidth] = useState(120);

  return (
    <div>
      <button onClick={() => setWidth(600)}>Widen</button>
      <div style={{ width, overflow: 'hidden' }}>
        <ExpandableList isChipCountDisplayed>
          {Array.from({ length: 7 }, (_, index) => (
            <Tag
              key={index}
              text={`Option ${index + 1}`}
              color={MAIN_COLOR_NAMES[index]}
            />
          ))}
        </ExpandableList>
      </div>
    </div>
  );
};

export const RecomputesVisibleChipsOnResize: Story = {
  render: () => <ResizableExpandableListWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const countVisibleOptions = () =>
      canvas.queryAllByText(/^Option \d+$/).length;

    // At the initial narrow width, only a subset of the 7 chips fit.
    await waitFor(() => {
      expect(countVisibleOptions()).toBeLessThan(7);
    });

    const initialVisibleCount = countVisibleOptions();

    await userEvent.click(await canvas.findByText('Widen'));

    // After widening, the list recomputes and reveals more chips than before.
    await waitFor(() => {
      expect(countVisibleOptions()).toBeGreaterThan(initialVisibleCount);
    });
  },
};
