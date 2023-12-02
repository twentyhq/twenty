import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { DesktopNavigationDrawer } from '../DesktopNavigationDrawer';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof DesktopNavigationDrawer> = {
  title: 'Modules/Navigation/DesktopNavigationDrawer',
  component: DesktopNavigationDrawer,
};

export default meta;
type Story = StoryObj<typeof DesktopNavigationDrawer>;

export const Default: Story = {
  decorators: [
    ComponentDecorator,
    ComponentWithRouterDecorator,
    SnackBarDecorator,
  ],
};
