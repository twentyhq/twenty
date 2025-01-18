import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  GithubVersionLink,
  IconAt,
  IconBell,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheckbox,
  IconColorSwatch,
  IconDoorEnter,
  IconMail,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  getOsControlSymbol,
} from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SettingsPath } from '@/types/SettingsPath';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { PrefetchLoadedDecorator } from '~/testing/decorators/PrefetchLoadedDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import jsonPage from '../../../../../../../package.json';
import { NavigationDrawer } from '../NavigationDrawer';
import { NavigationDrawerItem } from '../NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '../NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '../NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '../NavigationDrawerSectionTitle';
const meta: Meta<typeof NavigationDrawer> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawer',
  component: NavigationDrawer,
  decorators: [
    ComponentWithRouterDecorator,
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
    PrefetchLoadedDecorator,
    (Story) => {
      const setCurrentWorkspaceMember = useSetRecoilState(
        currentWorkspaceMemberState,
      );
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );
      useEffect(() => {
        setObjectMetadataItems(generatedMockObjectMetadataItems);
        setCurrentWorkspaceMember(mockedWorkspaceMemberData);
      }, [setObjectMetadataItems, setCurrentWorkspaceMember]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
  argTypes: { children: { control: false }, footer: { control: false } },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawer>;

export const Default: Story = {
  args: {
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerItem label="Search" Icon={IconSearch} active />
          <NavigationDrawerItem
            label="Notifications"
            to="/inbox"
            Icon={IconBell}
            soon={true}
          />
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            keyboard={[`${getOsControlSymbol()}`, 'K']}
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
        </NavigationDrawerSection>

        <CurrentWorkspaceMemberFavoritesFolders />

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Workspace" />
          <NavigationDrawerItem
            label="Companies"
            to="/companies"
            Icon={IconBuildingSkyscraper}
          />
          <NavigationDrawerItem label="People" to="/people" Icon={IconUser} />
          <NavigationDrawerItem label="Opportunities" Icon={IconTargetArrow} />
        </NavigationDrawerSection>
      </>
    ),
    footer: null,
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Workspace')).toBeInTheDocument();
  },
};

export const Settings: Story = {
  args: {
    title: 'Settings',
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="User" />
          <NavigationDrawerItem
            label="Profile"
            to={getSettingsPath(SettingsPath.ProfilePage)}
            Icon={IconUserCircle}
            active
          />
          <NavigationDrawerItem
            label="Appearance"
            to={getSettingsPath(SettingsPath.Experience)}
            Icon={IconColorSwatch}
          />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Accounts"
              to={getSettingsPath(SettingsPath.Accounts)}
              Icon={IconAt}
            />
            <NavigationDrawerSubItem
              label="Emails"
              to={getSettingsPath(SettingsPath.AccountsEmails)}
              Icon={IconMail}
              subItemState="intermediate-before-selected"
            />
            <NavigationDrawerSubItem
              label="Calendar"
              to={getSettingsPath(SettingsPath.AccountsCalendars)}
              Icon={IconCalendarEvent}
              subItemState="last-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Workspace" />
          <NavigationDrawerItem
            label="General"
            to={getSettingsPath(SettingsPath.Workspace)}
            Icon={IconSettings}
          />
          <NavigationDrawerItem
            label="Members"
            to={getSettingsPath(SettingsPath.WorkspaceMembersPage)}
            Icon={IconUsers}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Other" />
          <NavigationDrawerItem label="Logout" Icon={IconDoorEnter} />
        </NavigationDrawerSection>
      </>
    ),
    footer: <GithubVersionLink version={jsonPage.version} />,
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('User')).toBeInTheDocument();
  },
};
