import { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { AppTooltip as Tooltip, TooltipPosition } from '../AppTooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    place: TooltipPosition.Bottom,
    content: 'Tooltip Test',
    isOpen: true,
    anchorSelect: '#hover-text',
  },
  decorators: [ComponentDecorator],
  render: (args) => (
    <>
      <p id="hover-text" data-testid="tooltip">
        Hover me!
      </p>
      {/* eslint-disable-next-line twenty/no-spread-props */}
      <Tooltip {...args} />
    </>
  ),
};

export const Catalog: Story = {
  args: { isOpen: true, content: 'Tooltip Test' },
  play: async ({ canvasElement }) => {
    Object.values(TooltipPosition).forEach((position) => {
      const element = canvasElement.querySelector(
        `#${position}`,
      ) as HTMLElement;
      element.style.margin = '75px';
    });
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'anchorSelect',
          values: Object.values(TooltipPosition),
          props: (anchorSelect: TooltipPosition) => ({
            anchorSelect: `#${anchorSelect}`,
            place: anchorSelect,
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
