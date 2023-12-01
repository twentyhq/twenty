import { Meta, StoryObj } from '@storybook/react';

import { Favorites } from '@/favorites/components/Favorites';
import {
  IconBell,
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from '@/ui/display/icon';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import MainNavbar from '../MainNavbar';
import NavItem from '../NavItem';
import NavTitle from '../NavTitle';

const meta: Meta<typeof MainNavbar> = {
  title: 'UI/Navigation/NavigationDrawer/MainNavbar',
  component: MainNavbar,
  decorators: [SnackBarDecorator],
};

export default meta;
type Story = StoryObj<typeof MainNavbar>;

const navItems = (
  <>
    <NavItem label="Search" Icon={IconSearch} />
    <NavItem label="Notifications" to="/inbox" Icon={IconBell} soon={true} />
    <NavItem label="Settings" to="/settings/profile" Icon={IconSettings} />
    <NavItem label="Tasks" to="/tasks" Icon={IconCheckbox} count={2} />
    <Favorites />
    <NavTitle label="Workspace" />
    <NavItem label="Companies" to="/companies" Icon={IconBuildingSkyscraper} />
    <NavItem label="People" to="/people" Icon={IconUser} />
    <NavItem label="Opportunities" Icon={IconTargetArrow} />
  </>
);

export const Default: Story = {
  args: { children: navItems },
  argTypes: { children: { control: false } },
  decorators: [ComponentWithRouterDecorator],
};
