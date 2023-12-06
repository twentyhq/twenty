import { Meta, StoryObj } from '@storybook/react';

import { Favorites } from '@/favorites/components/Favorites';
import {
  IconBell,
  IconBuildingSkyscraper,
  IconCheckbox,
  IconColorSwatch,
  IconLogout,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
} from '@/ui/display/icon';
import { GithubVersionLink } from '@/ui/navigation/link/components/GithubVersionLink';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { NavigationDrawer } from '../NavigationDrawer';
import { NavigationDrawerItem } from '../NavigationDrawerItem';
import { NavigationDrawerSectionTitle } from '../NavigationDrawerSectionTitle';

const meta: Meta<typeof NavigationDrawer> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawer',
  component: NavigationDrawer,
  decorators: [ComponentWithRouterDecorator, SnackBarDecorator],
  parameters: { layout: 'fullscreen' },
  argTypes: { children: { control: false }, footer: { control: false } },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawer>;

export const Default: Story = {
  args: {
    children: (
      <>
        <NavigationDrawerItem label="Search" Icon={IconSearch} active />
        <NavigationDrawerItem
          label="Notifications"
          to="/inbox"
          Icon={IconBell}
          soon={true}
        />
        <NavigationDrawerItem
          label="Settings"
          to="/settings/profile"
          Icon={IconSettings}
        />
        <NavigationDrawerItem
          label="Tasks"
          to="/tasks"
          Icon={IconCheckbox}
          count={2}
        />
        <Favorites />
        <NavigationDrawerSectionTitle label="Workspace" />
        <NavigationDrawerItem
          label="Companies"
          to="/companies"
          Icon={IconBuildingSkyscraper}
        />
        <NavigationDrawerItem label="People" to="/people" Icon={IconUser} />
        <NavigationDrawerItem label="Opportunities" Icon={IconTargetArrow} />
      </>
    ),
    footer: null,
  },
};

export const Submenu: Story = {
  args: {
    isSubMenu: true,
    title: 'Settings',
    children: (
      <>
        <NavigationDrawerSectionTitle label="User" />
        <NavigationDrawerItem
          label="Profile"
          to="/settings/profile"
          Icon={IconUserCircle}
          active
        />
        <NavigationDrawerItem
          label="Appearance"
          to="/settings/profile/appearance"
          Icon={IconColorSwatch}
        />
        <NavigationDrawerSectionTitle label="Workspace" />
        <NavigationDrawerItem
          label="General"
          to="/settings/workspace"
          Icon={IconSettings}
        />
        <NavigationDrawerItem
          label="Members"
          to="/settings/workspace-members"
          Icon={IconUsers}
        />

        <NavigationDrawerSectionTitle label="Other" />
        <NavigationDrawerItem label="Logout" Icon={IconLogout} />
      </>
    ),
    footer: <GithubVersionLink />,
  },
};
