import { Meta, StoryObj } from '@storybook/react';

import {
  IconColorSwatch,
  IconLogout,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from '@/ui/display/icon';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import NavItem from '../NavItem';
import NavTitle from '../NavTitle';
import SubMenuNavbar from '../SubMenuNavbar';

const meta: Meta<typeof SubMenuNavbar> = {
  title: 'UI/Navigation/Navbar/SubMenuNavbar',
  component: SubMenuNavbar,
};

export default meta;
type Story = StoryObj<typeof SubMenuNavbar>;

const navItems = (
  <>
    <NavTitle label="User" />
    <NavItem
      label="Profile"
      to="/settings/profile"
      Icon={IconUserCircle}
      active
    />
    <NavItem
      label="Appearance"
      to="/settings/profile/appearance"
      Icon={IconColorSwatch}
    />
    <NavTitle label="Workspace" />
    <NavItem label="General" to="/settings/workspace" Icon={IconSettings} />
    <NavItem
      label="Members"
      to="/settings/workspace-members"
      Icon={IconUsers}
    />
    <NavTitle label="Other" />

    <NavItem label="Logout" Icon={IconLogout} />
  </>
);

export const Default: Story = {
  args: { children: navItems, backButtonTitle: 'Back' },
  argTypes: { children: { control: false } },
  decorators: [ComponentWithRouterDecorator],
};
