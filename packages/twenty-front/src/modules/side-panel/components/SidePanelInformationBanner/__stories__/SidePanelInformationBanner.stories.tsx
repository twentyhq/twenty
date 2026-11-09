import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LightButton } from 'twenty-ui/components/input';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  ComponentDecorator,
} from 'twenty-ui/testing';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';

const meta: Meta<typeof SidePanelInformationBanner> = {
  title: 'UI/Feedback/SidePanelInformationBanner',
  component: SidePanelInformationBanner,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SidePanelInformationBanner>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    message: 'Max 200 bars per chart. Consider adding a filter',
  },
};

export const ShortMessage: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    message: 'Too many groups',
  },
};

export const LongMessage: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    message:
      'The chart has exceeded the maximum number of 200 bars. Please consider adding filters to reduce the number of data points displayed.',
  },
};

const handleAction = fn();

export const WithAction: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    variant: 'warning',
    message: 'This widget also filters on Close date.',
    action: <LightButton onClick={handleAction}>Fix it</LightButton>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('This widget also filters on Close date.'),
    ).toBeVisible();

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Fix it' }),
    );

    expect(handleAction).toHaveBeenCalledTimes(1);
  },
};
