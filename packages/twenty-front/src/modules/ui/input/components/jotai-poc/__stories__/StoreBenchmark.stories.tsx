import { type Meta, type StoryObj } from '@storybook/react-vite';

import { StoreBenchmark } from '@/ui/input/components/jotai-poc/StoreBenchmark';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'Performance/Input/StoreBenchmark',
  component: StoreBenchmark,
  decorators: [ComponentDecorator],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof StoreBenchmark>;

export const Default: Story = {};
