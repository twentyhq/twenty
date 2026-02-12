import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ReactContextBenchmark } from '@/ui/input/components/jotai-poc/ReactContextBenchmark';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'Performance/Input/ReactContextBenchmark',
  component: ReactContextBenchmark,
  decorators: [ComponentDecorator],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof ReactContextBenchmark>;

export const Default: Story = {};
