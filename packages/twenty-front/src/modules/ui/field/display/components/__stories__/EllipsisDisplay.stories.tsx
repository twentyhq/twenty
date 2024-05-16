import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';

const meta: Meta = {
  title: 'UI/Input/EllipsisDisplay/EllipsisDisplay',
  component: EllipsisDisplay,
  decorators: [ComponentDecorator],
  args: {
    maxWidth: 100,
    children: 'This is a long text that should be truncated',
  },
};

export default meta;

type Story = StoryObj<typeof EllipsisDisplay>;

export const Default: Story = {};
