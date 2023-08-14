import { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { CircularProgressBar } from '../CircularProgressBar';

const meta: Meta<typeof CircularProgressBar> = {
  title: 'UI/CircularProgressBar/CircularProgressBar',
  component: CircularProgressBar,
  args: {
    size: 50,
  },
};

export default meta;

type Story = StoryObj<typeof CircularProgressBar>;
const args = {};
const defaultArgTypes = {
  control: false,
};
export const Default: Story = {
  args,
  decorators: [ComponentDecorator],
};

export const Catalog = {
  args: {
    ...args,
  },
  argTypes: {
    strokeWidth: defaultArgTypes,
    segmentColor: defaultArgTypes,
  },
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
