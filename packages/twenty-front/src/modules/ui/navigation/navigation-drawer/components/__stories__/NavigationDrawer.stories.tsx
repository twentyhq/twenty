import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SettingsPath } from 'twenty-shared/types';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { PrefetchLoadedDecorator } from '~/testing/decorators/PrefetchLoadedDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconAt,
  IconBell,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheckbox,
  IconColorSwatch,
  IconMail,
  IconSearch,
  IconServer,
  IconSettings,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
} from 'twenty-ui/display';
import { AdvancedSettingsToggle } from 'twenty-ui/navigation';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';

const meta: Meta<typeof NavigationDrawer> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawer',
  component: NavigationDrawer,
  decorators: [
    ComponentWithRouterDecorator,
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
    PrefetchLoadedDecorator,
    I18nFrontDecorator,
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
  argTypes: { children: { control: false } },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawer>;

export const Default: Story = {
  args: {
    title: 'Default',
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
          <NavigationDrawerItem
            label="Admin Panel"
            to={getSettingsPath(SettingsPath.AdminPanel)}
            Icon={IconServer}
          />
        </NavigationDrawerSection>

        <NavigationDrawerFixedContent>
          <AdvancedSettingsToggle
            isAdvancedModeEnabled={false}
            setIsAdvancedModeEnabled={() => {}}
            label="Advanced:"
          />
        </NavigationDrawerFixedContent>
      </>
    ),
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('User')).toBeInTheDocument();
  },
};
