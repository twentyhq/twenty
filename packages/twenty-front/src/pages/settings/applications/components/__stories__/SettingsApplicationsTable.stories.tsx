import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type ApplicationWithoutRelation } from '@/applications/types/ApplicationWithoutRelation';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const STANDARD_APPLICATION: ApplicationWithoutRelation = {
  id: 'standard-application-id',
  name: 'Standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const NPM_APPLICATION: ApplicationWithoutRelation = {
  id: 'npm-application-id',
  name: 'Acme Sync',
  description: 'Keeps Acme in sync',
  universalIdentifier: 'npm-application-universal-identifier',
  applicationRegistration: {
    id: 'npm-registration-id',
    sourceType: ApplicationRegistrationSourceType.NPM,
  },
};

const OAUTH_APPLICATION: ApplicationWithoutRelation = {
  id: 'oauth-application-id',
  name: 'Zapier',
  universalIdentifier: 'oauth-application-universal-identifier',
  applicationRegistration: {
    id: 'oauth-registration-id',
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  },
};

const getRowLinks = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'));

const meta: Meta<typeof SettingsApplicationsTable> = {
  title: 'Pages/Settings/Applications/SettingsApplicationsTable',
  component: SettingsApplicationsTable,
  decorators: [ComponentWithRouterDecorator],
  args: {
    applications: [OAUTH_APPLICATION, NPM_APPLICATION, STANDARD_APPLICATION],
    builtInAccountApps: BUILT_IN_ACCOUNT_APPS,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsApplicationsTable>;

export const BuiltInAccountAppsListedAfterStandardApp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Gmail and Calendar')).toBeVisible();
    expect(getRowLinks(canvasElement)).toEqual([
      '/settings/applications/standard-application-id',
      '/settings/applications/google',
      '/settings/applications/outlook',
      '/settings/applications/imap',
      '/settings/applications/npm-application-id',
      '/settings/applications/oauth-application-id',
    ]);
    expect(
      canvas.getByRole('link', { name: /Gmail and Calendar/ }),
    ).toHaveTextContent('Built-in');
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
      expect(getRowLinks(canvasElement)).toEqual([
        '/settings/applications/outlook',
      ]),
    );

    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'outlook ');

    await waitFor(() =>
      expect(getRowLinks(canvasElement)).toEqual([
        '/settings/applications/outlook',
      ]),
    );
  },
};

export const KeepsExistingOrderWithoutBuiltInAccountApps: Story = {
  args: {
    builtInAccountApps: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Acme Sync')).toBeVisible();
    expect(getRowLinks(canvasElement)).toEqual([
      '/settings/applications/npm-application-id',
      '/settings/applications/standard-application-id',
      '/settings/applications/oauth-application-id',
    ]);
  },
};
