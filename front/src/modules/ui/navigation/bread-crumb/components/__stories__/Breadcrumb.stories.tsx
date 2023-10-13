import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { Breadcrumb } from '../Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Breadcrumb/Breadcrumb',
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
