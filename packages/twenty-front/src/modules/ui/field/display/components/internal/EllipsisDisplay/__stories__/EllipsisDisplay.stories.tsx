import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from 'twenty-ui/testing';

import { EllipsisDisplay } from '@/ui/field/display/components/internal/EllipsisDisplay/EllipsisDisplay';

const meta: Meta<typeof EllipsisDisplay> = {
  title: 'UI/Data Display/EllipsisDisplay',
  component: EllipsisDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof EllipsisDisplay>;

export const Default: Story = {
  args: {
    children: 'A fairly long text that should be truncated with an ellipsis',
    maxWidth: 200,
  },
};
