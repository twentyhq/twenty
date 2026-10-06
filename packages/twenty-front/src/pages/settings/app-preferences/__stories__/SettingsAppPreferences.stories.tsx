import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay } from 'msw';
import { within } from 'storybook/test';

import { PermissionFlagType } from '~/generated-metadata/graphql';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';

import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';
import {
  mockedApplicationConnectionProviders,
  mockedApplicationsWithSettingsMenuItems,
  mockedCalendarChannels,
  mockedConnectedAccounts,
  mockedMessageChannels,
} from '~/pages/settings/app-preferences/__stories__/appPreferencesStoryMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferences',
  component: SettingsAppPreferences,
  decorators: [PageDecorator, PermissionFlagsDecorator],
  args: {
    routePath: '/settings/accounts',
  },
  parameters: {
    layout: 'fullscreen',
    // The nav only lists App preferences for members allowed to manage their
    // connected accounts.
    permissionFlags: [PermissionFlagType.CONNECTED_ACCOUNTS],
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAppPreferences>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Shared accounts between apps', undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Gmail', undefined, { timeout: 3000 });
  },
};

export const WithAccountsAndAppPreferences: Story = {
  parameters: {
    msw: {
      handlers: [
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
        metadataGraphql.query(
          'ApplicationConnectionProviders',
          ({ variables }) =>
            HttpResponse.json({
              data: {
                applicationConnectionProviders:
                  mockedApplicationConnectionProviders.filter(
                    (provider) =>
                      provider.applicationId === variables.applicationId,
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
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim.apple@outlook.com', undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Stripe', undefined, { timeout: 3000 });
    await canvas.findByText('Missing account', undefined, { timeout: 3000 });
  },
};
