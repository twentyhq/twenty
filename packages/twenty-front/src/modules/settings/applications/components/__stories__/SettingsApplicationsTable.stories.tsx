import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { getSettingsApplicationsTableRowLinks } from '@/settings/applications/testing/getSettingsApplicationsTableRowLinks';
import {
  NPM_APPLICATION,
  OAUTH_ONLY_APPLICATION,
  STANDARD_APPLICATION,
  TARBALL_APPLICATION,
} from '@/settings/applications/testing/settingsApplicationsTableFixtures';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof SettingsApplicationsTable> = {
  title: 'Modules/Settings/Applications/SettingsApplicationsTable',
  component: SettingsApplicationsTable,
  decorators: [ComponentWithRouterDecorator],
  args: {
    title: 'Installed apps',
    description: 'All the applications currently installed on this workspace',
    applications: [
      OAUTH_ONLY_APPLICATION,
      NPM_APPLICATION,
      STANDARD_APPLICATION,
    ],
    builtInApps: [...BUILT_IN_ACCOUNT_APPS, ...BUILT_IN_MCP_CLIENT_APPS],
    linkTarget: 'applicationDetail',
    middleColumn: 'type',
  },
};

export default meta;

type Story = StoryObj<typeof SettingsApplicationsTable>;

export const BuiltInAppsListedAfterStandardApp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Gmail and Calendar')).toBeVisible();
    expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([
      '/settings/applications/standard-application-id',
      '/settings/applications/google',
      '/settings/applications/outlook',
      '/settings/applications/imap',
      '/settings/applications/chatgpt',
      '/settings/applications/claude',
      '/settings/applications/npm-application-id',
      '/settings/applications/oauth-application-id',
    ]);
    expect(
      canvas.getByRole('link', { name: /Gmail and Calendar/ }),
    ).toHaveTextContent('Built-in');
    expect(canvas.getByRole('link', { name: /Claude/ })).toHaveTextContent(
      'Built-in',
    );
  },
};

export const SearchMatchesBuiltInAccountApps: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = await canvas.findByPlaceholderText(
      'Search an application',
    );

    await userEvent.type(searchInput, 'microsoft');

    await waitFor(() =>
      expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([
        '/settings/applications/outlook',
      ]),
    );

    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'outlook ');

    await waitFor(() =>
      expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([
        '/settings/applications/outlook',
      ]),
    );
  },
};

export const SearchMatchesTheDescriptionShownForTheStandardApp: Story = {
  args: {
    applications: [
      { ...STANDARD_APPLICATION, name: 'twenty-standard' },
      NPM_APPLICATION,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      await canvas.findByPlaceholderText('Search an application'),
      'data model',
    );

    await waitFor(() =>
      expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([
        '/settings/applications/standard-application-id',
      ]),
    );
  },
};

export const SearchWithNoMatchShowsAnEmptyState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      await canvas.findByPlaceholderText('Search an application'),
      'no such app',
    );

    expect(await canvas.findByRole('status')).toHaveTextContent(
      'No application matches your search',
    );
    expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([]);
  },
};

export const KeepsExistingOrderWithoutBuiltInAccountApps: Story = {
  args: {
    builtInApps: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Acme Sync')).toBeVisible();
    expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([
      '/settings/applications/npm-application-id',
      '/settings/applications/standard-application-id',
      '/settings/applications/oauth-application-id',
    ]);
  },
};

export const StatusColumnShowsTheMostUrgentStatus: Story = {
  args: {
    applications: [NPM_APPLICATION, TARBALL_APPLICATION, STANDARD_APPLICATION],
    builtInApps: [],
    middleColumn: 'status',
    statusesById: {
      [NPM_APPLICATION.id]: [
        { type: 'updateAvailable' },
        { type: 'missingConfiguration' },
      ],
      [TARBALL_APPLICATION.id]: [{ type: 'updateAvailable' }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Status')).toBeVisible();
    expect(canvas.queryByText('Type')).not.toBeInTheDocument();

    const acmeRow = canvas.getByRole('link', { name: /Acme Sync/ });

    expect(within(acmeRow).getByText('Setup incomplete')).toBeVisible();
    expect(acmeRow).not.toHaveTextContent('Update');
    expect(acmeRow).not.toHaveTextContent('NPM');

    const weatherRow = canvas.getByRole('link', { name: /Weather Widget/ });

    expect(within(weatherRow).getByText('Update')).toBeVisible();

    const standardRow = canvas.getByRole('link', { name: /Standard/ });

    expect(standardRow).not.toHaveTextContent('Setup incomplete');
    expect(standardRow).not.toHaveTextContent('Update');
  },
};

export const TypeColumnShowsUpdateNextToTheDescription: Story = {
  args: {
    applications: [NPM_APPLICATION, TARBALL_APPLICATION],
    builtInApps: [],
    middleColumn: 'type',
    statusesById: {
      [NPM_APPLICATION.id]: [
        { type: 'missingConfiguration' },
        { type: 'updateAvailable' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const acmeRow = await canvas.findByRole('link', { name: /Acme Sync/ });

    expect(acmeRow).toHaveTextContent('NPM');
    expect(within(acmeRow).getByText('Update')).toBeVisible();
    expect(acmeRow).not.toHaveTextContent('Setup incomplete');

    const weatherRow = canvas.getByRole('link', { name: /Weather Widget/ });

    expect(weatherRow).toHaveTextContent('Tarball');
    expect(weatherRow).not.toHaveTextContent('Update');
  },
};

export const MemberRowsLinkToTheirPreferences: Story = {
  args: {
    title: 'Apps',
    description:
      'Choose your preferences for the apps installed on your workspace by the admin',
    applications: [OAUTH_ONLY_APPLICATION, NPM_APPLICATION],
    linkTarget: 'applicationPreferences',
    middleColumn: 'status',
    statusesById: {
      [NPM_APPLICATION.id]: [
        { type: 'missingConfiguration' },
        { type: 'reconnectNeeded' },
      ],
      [OAUTH_ONLY_APPLICATION.id]: [{ type: 'notConnected' }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Gmail and Calendar')).toBeVisible();
    expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([
      '/settings/app-preferences/google',
      '/settings/app-preferences/outlook',
      '/settings/app-preferences/imap',
      '/settings/app-preferences/chatgpt',
      '/settings/app-preferences/claude',
      '/settings/app-preferences/npm-application-id',
      '/settings/app-preferences/oauth-application-id',
    ]);

    const acmeRow = canvas.getByRole('link', { name: /Acme Sync/ });

    expect(within(acmeRow).getByText('Sync failed')).toBeVisible();
    expect(acmeRow).not.toHaveTextContent('Setup incomplete');

    expect(
      within(canvas.getByRole('link', { name: /Zapier/ })).getByText(
        'Not connected',
      ),
    ).toBeVisible();
  },
};

export const LoadingHidesSearchAndRows: Story = {
  args: {
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Installed apps')).toBeVisible();
    expect(
      canvas.queryByPlaceholderText('Search an application'),
    ).not.toBeInTheDocument();
    expect(getSettingsApplicationsTableRowLinks(canvasElement)).toEqual([]);
  },
};

export const HidesTheDescriptionOnMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Acme Sync')).toBeVisible();
    expect(canvas.getByText('Name')).toBeVisible();
    expect(canvas.queryByText('Description')).not.toBeInTheDocument();

    const acmeRow = canvas.getByRole('link', { name: /Acme Sync/ });

    expect(acmeRow).toHaveTextContent('NPM');
    expect(acmeRow).not.toHaveTextContent('Keeps Acme in sync');
    expect(acmeRow.scrollWidth).toBeLessThanOrEqual(acmeRow.clientWidth);
  },
};
