import type { Meta, StoryObj } from '@storybook/react';
import { IconBell } from '@tabler/icons-react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { IconButton } from '../IconButton';
import { IconButtonGroup } from '../IconButtonGroup';

const meta: Meta<typeof IconButtonGroup> = {
  title: 'UI/Button/IconButtonGroup',
  component: IconButtonGroup,
};

export default meta;
type Story = StoryObj<typeof IconButtonGroup>;

const args = {
  children: [
    <IconButton icon={<IconBell />} />,
    <IconButton icon={<IconBell />} />,
  ],
};

export const Default: Story = {
  args,
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args,
  argTypes: {
    size: { control: false },
    variant: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'variants',
          values: ['transparent', 'border', 'shadow', 'white'],
          props: (variant: string) => ({
            variant,
          }),
        },
        {
          name: 'sizes',
          values: ['large', 'medium', 'small'],
          props: (size: string) => ({
            size,
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
