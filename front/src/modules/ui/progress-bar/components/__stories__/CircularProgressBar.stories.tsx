import { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { CircularProgressBar } from '../CircularProgressBar';

const meta: Meta<typeof CircularProgressBar> = {
  title: 'UI/CircularProgressBar/CircularProgressBar',
  component: CircularProgressBar,
  args: {
    size: 50,
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof CircularProgressBar>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof CircularProgressBar> = {
  argTypes: {},
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'barColor',
          values: [undefined, 'red'],
          props: (barColor: string) => ({ barColor }),
          labels: (color: string) => `Segment Color: ${color ?? 'default'}`,
        },
        {
          name: 'barWidth',
          values: [undefined, 5, 10],
          props: (barWidth: number) => ({ barWidth }),
          labels: (width: number) =>
            `Stroke Width: ${width ? width + ' px' : 'default'}`,
        },
        {
          name: 'size',
          values: [undefined, 80, 30],
          props: (size: number) => ({ size }),
          labels: (size: number) => `Size: ${size ? size + ' px' : 'default'}`,
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
