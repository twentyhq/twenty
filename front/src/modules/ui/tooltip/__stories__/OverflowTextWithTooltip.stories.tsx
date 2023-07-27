import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const dummyText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tellus diam, rhoncus nec consequat quis, dapibus quis massa. Praesent tincidunt augue at ex bibendum, non finibus augue faucibus. In at gravida orci. Nulla facilisi. Proin ut augue ut nisi pellentesque tristique. Proin sodales libero id turpis tincidunt posuere.';

const meta: Meta<typeof OverflowingTextWithTooltip> = {
  title: 'UI/Tooltip/OverflowingTextWithTooltip',
  component: OverflowingTextWithTooltip,
};

export default meta;
type Story = StoryObj<typeof OverflowingTextWithTooltip>;

export const Default: Story = {
  args: {
    text: dummyText,
  },
  decorators: [ComponentDecorator],
  render: (args) => (
    <>
      <OverflowingTextWithTooltip {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = canvas.getByTestId('tooltip');
    userEvent.hover(tooltip);
  },
};
