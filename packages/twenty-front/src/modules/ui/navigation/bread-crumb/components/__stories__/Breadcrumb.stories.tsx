import { type Meta, type StoryObj } from '@storybook/react';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Navigation/Breadcrumb/Breadcrumb',
  component: Breadcrumb,
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
  args: {
    links: [
      { children: 'Objects', href: '/link-1' },
      { children: 'Companies', href: '/link-2' },
      { children: 'New' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};
