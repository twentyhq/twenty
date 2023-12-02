import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { MobileNavigationDrawer } from '../MobileNavigationDrawer';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof MobileNavigationDrawer> = {
  title: 'Modules/Navigation/MobileNavigationDrawer',
  component: MobileNavigationDrawer,
};

export default meta;
type Story = StoryObj<typeof MobileNavigationDrawer>;

export const Default: Story = {
  decorators: [
    ComponentDecorator,
    ComponentWithRouterDecorator,
    SnackBarDecorator,
  ],
};
