import { type Meta, type StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const placeholderText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tellus diam, rhoncus nec consequat quis, dapibus quis massa. Praesent tincidunt augue at ex bibendum, non finibus augue faucibus. In at gravida orci. Nulla facilisi. Proin ut augue ut nisi pellentesque tristique. Proin sodales libero id turpis tincidunt posuere.';

const meta: Meta<typeof OverflowingTextWithTooltip> = {
  title: 'UI/Tooltip/OverflowingTextWithTooltip',
  component: OverflowingTextWithTooltip,
};

export default meta;
type Story = StoryObj<typeof OverflowingTextWithTooltip>;

export const Default: Story = {
  args: {
    text: placeholderText,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    userEvent.hover(tooltip);
  },
};
