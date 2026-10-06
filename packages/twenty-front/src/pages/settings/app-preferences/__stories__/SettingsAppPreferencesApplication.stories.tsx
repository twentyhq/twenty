import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay } from 'msw';
import { within } from 'storybook/test';

import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';

import { SettingsAppPreferencesApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesApplication';
import {
  SCROLLER_APPLICATION_ID,
  mockedApplicationConnectionProviders,
  mockedApplicationsWithSettingsMenuItems,
  mockedCalendarChannels,
  mockedConnectedAccounts,
  mockedMessageChannels,
} from '~/pages/settings/app-preferences/__stories__/appPreferencesStoryMocks';

const handlers = [
  metadataGraphql.query('MyConnectedAccounts', () =>
    HttpResponse.json({
      data: { myConnectedAccounts: mockedConnectedAccounts },
    }),
  ),
  metadataGraphql.query('MyMessageChannels', () =>
    HttpResponse.json({
      data: { myMessageChannels: mockedMessageChannels },
    }),
  ),
  metadataGraphql.query('MyCalendarChannels', () =>
    HttpResponse.json({
      data: { myCalendarChannels: mockedCalendarChannels },
    }),
  ),
  metadataGraphql.query('FindManyApplicationsWithSettingsMenuItems', () =>
    HttpResponse.json({
      data: {
        findManyApplications: mockedApplicationsWithSettingsMenuItems,
      },
    }),
  ),
  metadataGraphql.query('ApplicationConnectionProviders', ({ variables }) =>
    HttpResponse.json({
      data: {
        applicationConnectionProviders:
          mockedApplicationConnectionProviders.filter(
            (provider) => provider.applicationId === variables.applicationId,
          ),
      },
    }),
  ),
  // The front component itself is served by a running app; keep it
  // loading so the section shows its skeleton rather than an error.
  metadataGraphql.query('FindOneFrontComponent', async () => {
    await delay('infinite');
  }),
  ...graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferencesApplication',
  component: SettingsAppPreferencesApplication,
  decorators: [PageDecorator, PermissionFlagsDecorator],
  args: {
    routePath: '/settings/accounts/apps/:applicationId',
    routeParams: { ':applicationId': CUSTOM_WORKSPACE_APPLICATION_MOCK.id },
  },
  parameters: {
    layout: 'fullscreen',
    // The nav only lists App preferences for members allowed to manage their
    // connected accounts.
    permissionFlags: [PermissionFlagType.CONNECTED_ACCOUNTS],
    msw: { handlers },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAppPreferencesApplication>;

export const WithConnectedAccount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });
    await canvas.findByText('Preferences', undefined, { timeout: 3000 });
  },
};

export const MissingAccount: Story = {
  args: {
    routeParams: { ':applicationId': SCROLLER_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Scrolling preferences', undefined, {
      timeout: 3000,
    });
  },
};
