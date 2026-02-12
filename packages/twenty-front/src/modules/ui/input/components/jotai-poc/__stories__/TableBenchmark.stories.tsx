import { type Meta, type StoryObj } from '@storybook/react-vite';

import { TableBenchmark } from '@/ui/input/components/jotai-poc/TableBenchmark';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'Performance/Input/TableBenchmark',
  component: TableBenchmark,
  decorators: [ComponentDecorator],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof TableBenchmark>;

export const Default: Story = {};
