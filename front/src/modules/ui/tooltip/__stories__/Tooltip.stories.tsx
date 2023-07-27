import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { AppTooltip, TooltipValues } from '../AppTooltip';

const meta: Meta<typeof AppTooltip> = {
  title: 'UI/Tooltip/Tooltip',
  component: AppTooltip,
};

export default meta;
type Story = StoryObj<typeof AppTooltip>;

export const Default: Story = {
  args: {
    place: 'bottom',
    content: 'Tooltip Test',
    anchorSelect: '#hover-text',
  },
  decorators: [ComponentDecorator],
  render: (args) => (
    <>
      <p id="hover-text" data-testid="tooltip">
        Hover me!
      </p>
      <AppTooltip {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = canvas.getByTestId('tooltip');
    userEvent.hover(tooltip);
  },
};

export const Catalog: Story = {
  args: { isOpen: true, content: 'Tooltip Test' },
  play: async ({ canvasElement }) => {
    Object.values(TooltipValues).forEach((position) => {
      const element = canvasElement.querySelector(
        `#${position}`,
      ) as HTMLElement;
      element.style.margin = '75px';
    });
  },
  parameters: {
    catalog: [
      {
        name: 'anchorSelect',
        values: Object.values(TooltipValues),
        props: (anchorSelect: TooltipValues) => ({
          anchorSelect: `#${anchorSelect}`,
          place: anchorSelect,
        }),
      },
    ],
  },
  decorators: [CatalogDecorator],
};
