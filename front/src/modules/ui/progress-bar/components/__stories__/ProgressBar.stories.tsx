import { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '../../../../../testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '../../../../../testing/decorators/ComponentDecorator';
import { ProgressBar } from '../ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar/ProgressBar',
  component: ProgressBar,
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;
const args = {
  duration: 10,
  delay: 10,
  easing: 'easeInOut',
  barHeight: 24,
  barColor: 'red',
  autoStart: false,
};
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
    autoStart: true,
    duration: 10000,
  },
  argTypes: {
    duration: defaultArgTypes,
    delay: defaultArgTypes,
    easing: defaultArgTypes,
    barHeight: defaultArgTypes,
    barColor: defaultArgTypes,
    autoStart: defaultArgTypes,
  },
  parameters: {
    catalog: [
      {
        name: 'animations',
        values: [
          'linear',
          'easeIn',
          'easeOut',
          'easeInOut',
          'circIn',
          'circOut',
          'circInOut',
          'backIn',
          'backOut',
          'backInOut',
          'anticipate',
        ],
        props: (easing: string) => ({ easing }),
        labels: (animation: string) => `Animation: ${animation}`,
      },
      {
        name: 'delays',
        values: [0, 10, 100, 1000],
        props: (delay: number) => ({ delay }),
        labels: (delay: number) => `Delay: ${delay} ms`,
      },
      {
        name: 'sizes',
        values: [10, 20, 30, 40],
        props: (barHeight: number) => ({ barHeight }),
        labels: (size: number) => `Size: ${size} px`,
      },
    ],
  },
  decorators: [CatalogDecorator],
};
