import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { expect, fn, userEvent, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationSourceType,
  ApplicationVariableScope,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';
import { SettingsApplicationsInstalledAppsSection } from '@/settings/applications/components/SettingsApplicationsInstalledAppsSection';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const buildApplicationVariable = ({
  key,
  value,
  scope,
}: {
  key: string;
  value: string;
  scope: ApplicationVariableScope;
}) => ({
  __typename: 'ApplicationVariable',
  id: `${key}-id`,
  key,
  label: key,
  value,
  isRequired: true,
  isDeprecated: false,
  scope,
});

const buildApplication = ({
  id,
  name,
  description,
  latestAvailableVersion,
}: {
  id: string;
  name: string;
  description: string;
  latestAvailableVersion: string;
}) => ({
  __typename: 'Application',
  id,
  name,
  description,
  logoUrl: null,
  version: '1.0.0',
  universalIdentifier: `${id}-universal-identifier`,
  applicationRegistrationId: `${id}-registration-id`,
  applicationRegistration: {
    __typename: 'ApplicationRegistrationSummary',
    id: `${id}-registration-id`,
    latestAvailableVersion,
    sourceType: ApplicationRegistrationSourceType.NPM,
  },
  defaultRoleId: null,
});

const RECORDER_APPLICATION = buildApplication({
  id: 'recorder-application-id',
  name: 'Recorder',
  description: 'Records your meetings',
  latestAvailableVersion: '1.1.0',
});

const ACME_APPLICATION = buildApplication({
  id: 'acme-application-id',
  name: 'Acme Sync',
  description: 'Keeps Acme in sync',
  latestAvailableVersion: '1.1.0',
});

const NOTES_APPLICATION = buildApplication({
  id: 'notes-application-id',
  name: 'Notes',
  description: 'Shares meeting notes',
  latestAvailableVersion: '1.0.0',
});

const APPLICATIONS = [
  RECORDER_APPLICATION,
  ACME_APPLICATION,
  NOTES_APPLICATION,
];

const APPLICATIONS_FOR_STATUS = [
  {
    __typename: 'Application',
    id: RECORDER_APPLICATION.id,
    applicationVariables: [
      buildApplicationVariable({
        key: 'RECORDER_API_KEY',
        value: '',
        scope: ApplicationVariableScope.WORKSPACE,
      }),
    ],
  },
  {
    __typename: 'Application',
    id: ACME_APPLICATION.id,
    applicationVariables: [],
  },
  {
    __typename: 'Application',
    id: NOTES_APPLICATION.id,
    applicationVariables: [
      buildApplicationVariable({
        key: 'NOTES_API_KEY',
        value: '********',
        scope: ApplicationVariableScope.WORKSPACE,
      }),
      buildApplicationVariable({
        key: 'PERSONAL_TOKEN',
        value: '',
        scope: ApplicationVariableScope.USER,
      }),
    ],
  },
];

const findManyApplicationsForStatus = fn();

const STATUS_LOAD_ERROR_MESSAGE =
  'App configuration could not be loaded. Check your connection and try again.';

const failNextStatusRequest = () => {
  getWorker().use(
    graphql.query(
      'FindManyApplicationsForStatus',
      () =>
        HttpResponse.json({
          errors: [
            {
              message: 'Internal server error',
              extensions: { code: 'INTERNAL_SERVER_ERROR' },
            },
          ],
        }),
      { once: true },
    ),
  );
};

const seedInstalledTabStory = ({
  isAppPreferencesEnabled,
}: {
  isAppPreferencesEnabled: boolean;
}) => {
  jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: isAppPreferencesEnabled,
      },
    ],
  });
  jotaiStore.set(metadataStoreState.atomFamily('applications'), {
    current: APPLICATIONS.map(
      ({
        id,
        universalIdentifier,
        name,
        description,
        version,
        applicationRegistrationId,
      }) => ({
        id,
        universalIdentifier,
        name,
        description,
        version,
        applicationRegistrationId,
      }),
    ),
    draft: [],
    status: 'up-to-date',
  });
};

const meta: Meta<typeof SettingsApplicationsInstalledAppsSection> = {
  title:
    'Modules/Settings/Applications/SettingsApplicationsInstalledAppsSection',
  component: SettingsApplicationsInstalledAppsSection,
  decorators: [ComponentWithRouterDecorator],
  beforeEach: async () => {
    findManyApplicationsForStatus.mockClear();
    await mockedApolloClient.clearStore();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyApplications', () =>
          HttpResponse.json({ data: { findManyApplications: APPLICATIONS } }),
        ),
        graphql.query('FindManyApplicationsForStatus', () => {
          findManyApplicationsForStatus();

          return HttpResponse.json({
            data: { findManyApplications: APPLICATIONS_FOR_STATUS },
          });
        }),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof SettingsApplicationsInstalledAppsSection>;

export const ShowsTypeAndUpdateTagWithoutAppPreferences: Story = {
  beforeEach: () => seedInstalledTabStory({ isAppPreferencesEnabled: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const acmeRow = await canvas.findByRole('link', { name: /Acme Sync/ });

    expect(await within(acmeRow).findByText('Update')).toBeVisible();
    expect(acmeRow).toHaveTextContent('NPM');

    const recorderRow = canvas.getByRole('link', { name: /Recorder/ });

    expect(within(recorderRow).getByText('Update')).toBeVisible();
    expect(recorderRow).toHaveTextContent('NPM');
    expect(canvas.getByText('Type')).toBeVisible();
    expect(canvas.queryByText('Status')).not.toBeInTheDocument();
    expect(canvas.queryByText('Setup incomplete')).not.toBeInTheDocument();
    expect(canvas.queryByText('Gmail and Calendar')).not.toBeInTheDocument();
    expect(findManyApplicationsForStatus).not.toHaveBeenCalled();
  },
};

export const ShowsStatusWithAppPreferences: Story = {
  beforeEach: () => seedInstalledTabStory({ isAppPreferencesEnabled: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const recorderRow = await canvas.findByRole('link', { name: /Recorder/ });

    expect(
      await within(recorderRow).findByText('Setup incomplete'),
    ).toBeVisible();
    expect(recorderRow).not.toHaveTextContent('Outdated');
    expect(canvas.getByText('Status')).toBeVisible();
    expect(canvas.queryByText('Type')).not.toBeInTheDocument();

    const acmeRow = canvas.getByRole('link', { name: /Acme Sync/ });

    expect(within(acmeRow).getByText('Outdated')).toBeVisible();
    expect(acmeRow).not.toHaveTextContent('NPM');

    const notesRow = canvas.getByRole('link', { name: /Notes/ });

    expect(notesRow).not.toHaveTextContent('Setup incomplete');
    expect(notesRow).not.toHaveTextContent('Outdated');

    const gmailRow = canvas.getByRole('link', { name: /Gmail and Calendar/ });

    expect(gmailRow).not.toHaveTextContent('Built-in');
    expect(gmailRow).not.toHaveTextContent('Setup incomplete');
  },
};

export const KeepsUpdateAndShowsErrorWhenConfigurationFailsToLoad: Story = {
  beforeEach: () => {
    seedInstalledTabStory({ isAppPreferencesEnabled: true });
    failNextStatusRequest();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText(STATUS_LOAD_ERROR_MESSAGE)).toBeVisible();
    expect(canvas.queryByText('Setup incomplete')).not.toBeInTheDocument();
    expect(
      await within(canvas.getByRole('link', { name: /Acme Sync/ })).findByText(
        'Outdated',
      ),
    ).toBeVisible();
    expect(canvas.getByRole('link', { name: /Notes/ })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    expect(
      await within(canvas.getByRole('link', { name: /Recorder/ })).findByText(
        'Setup incomplete',
      ),
    ).toBeVisible();
    expect(
      canvas.queryByText(STATUS_LOAD_ERROR_MESSAGE),
    ).not.toBeInTheDocument();
  },
};
