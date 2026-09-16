import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconGauge } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
const meta = {
  title: 'UI/Feedback/UsageProgressRow',
  component: UsageProgressRow,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 300 } },
  args: { Icon: IconGauge, label: 'Usage', value: 80 },
} satisfies Meta<typeof UsageProgressRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const PlainValue: Story = { args: { value: null, valueLabel: '100k' } };
export const NoLimit: Story = { args: { value: 0, valueLabel: 'No limit' } };
export const Exhausted: Story = { args: { value: 100 } };
