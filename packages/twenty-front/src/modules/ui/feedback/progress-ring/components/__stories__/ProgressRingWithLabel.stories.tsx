import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ProgressRingWithLabel } from '@/ui/feedback/progress-ring/components/ProgressRingWithLabel';
const meta = {
  title: 'UI/Feedback/ProgressRingWithLabel',
  component: ProgressRingWithLabel,
  decorators: [ComponentDecorator],
  args: { value: 80 },
} satisfies Meta<typeof ProgressRingWithLabel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { value: 0, label: 'No limit' } };
export const Full: Story = { args: { value: 100 } };
export const LongLabel: Story = { args: { label: 'Reset in 14 days (80%)' } };
