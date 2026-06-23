import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
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

const OPTIONS_COUNT = 7;
const COLLAPSED_WIDTH_PX = 96;

const optionTags = Array.from({ length: OPTIONS_COUNT }, (_, index) => (
  <Tag
    key={index}
    text={`Option ${index + 1}`}
    color={MAIN_COLOR_NAMES[index]}
  />
));

const countRenderedOptions = (canvas: ReturnType<typeof within>) =>
  canvas.queryAllByText(/^Option \d+$/).length;

export const RecomputesVisibleChipsOnResize: Story = {
  render: () => (
    <div
      data-resizable-cell
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        width: COLLAPSED_WIDTH_PX,
        minWidth: 56,
        maxWidth: '100%',
      }}
    >
      <ExpandableList isChipCountDisplayed>{optionTags}</ExpandableList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const resizableCell = canvasElement.querySelector<HTMLElement>(
      '[data-resizable-cell]',
    );

    await waitFor(() => {
      expect(countRenderedOptions(canvas)).toBeLessThan(OPTIONS_COUNT);
    });

    const collapsedCount = countRenderedOptions(canvas);

    if (isDefined(resizableCell)) {
      resizableCell.style.width = '100%';
    }

    await waitFor(() => {
      expect(countRenderedOptions(canvas)).toBeGreaterThan(collapsedCount);
    });
  },
};

export const ShowsAllChipsWhenCountHidden: Story = {
  render: () => (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ExpandableList isChipCountDisplayed={false}>{optionTags}</ExpandableList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(countRenderedOptions(canvas)).toBe(OPTIONS_COUNT);
    });
  },
};
