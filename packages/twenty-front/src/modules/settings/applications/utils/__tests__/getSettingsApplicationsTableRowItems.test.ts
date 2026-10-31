import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { getBuiltInAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAppLogoUrl';
import {
  NPM_APPLICATION,
  OAUTH_ONLY_APPLICATION,
  STANDARD_APPLICATION,
} from '@/settings/applications/testing/settingsApplicationsTableFixtures';
import { getSettingsApplicationsTableRowItems } from '@/settings/applications/utils/getSettingsApplicationsTableRowItems';
import {
  ApplicationRegistrationSourceType,
  WellKnownOAuthClient,
} from '~/generated-metadata/graphql';

describe('getSettingsApplicationsTableRowItems', () => {
  it('lists the standard app, then built-in apps, then the other apps with OAuth-only apps last', () => {
    const rowItems = getSettingsApplicationsTableRowItems({
      applications: [
        OAUTH_ONLY_APPLICATION,
        NPM_APPLICATION,
        STANDARD_APPLICATION,
      ],
      builtInApps: [...BUILT_IN_ACCOUNT_APPS, ...BUILT_IN_MCP_CLIENT_APPS],
      currentWorkspace: null,
    });

    expect(rowItems.map(({ id }) => id)).toEqual([
      STANDARD_APPLICATION.id,
      'google',
      'outlook',
      'imap',
      'chatgpt',
      'claude',
      NPM_APPLICATION.id,
      OAUTH_ONLY_APPLICATION.id,
    ]);
  });

  it('keeps the existing order without built-in apps', () => {
    const rowItems = getSettingsApplicationsTableRowItems({
      applications: [
        NPM_APPLICATION,
        OAUTH_ONLY_APPLICATION,
        STANDARD_APPLICATION,
      ],
      builtInApps: [],
      currentWorkspace: null,
    });

    expect(rowItems.map(({ id }) => id)).toEqual([
      NPM_APPLICATION.id,
      STANDARD_APPLICATION.id,
      OAUTH_ONLY_APPLICATION.id,
    ]);
  });

  it('gives installed apps their source type and built-in apps none', () => {
    const [googleRowItem, npmRowItem] = getSettingsApplicationsTableRowItems({
      applications: [NPM_APPLICATION],
      builtInApps: BUILT_IN_ACCOUNT_APPS.slice(0, 1),
      currentWorkspace: null,
    });

    expect(npmRowItem).toMatchObject({
      id: NPM_APPLICATION.id,
      name: 'Acme Sync',
      description: 'Keeps Acme in sync',
      sourceType: ApplicationRegistrationSourceType.NPM,
    });
    expect(googleRowItem).toMatchObject({
      id: 'google',
      name: 'Gmail and Calendar',
      description: 'Sync emails and calendar events from your Google accounts.',
    });
    expect(googleRowItem.sourceType).toBeUndefined();
  });

  it('gives the standard and custom apps the name and description their rows show', () => {
    const customApplication = {
      id: 'custom-application-id',
      name: 'workspace-custom',
      universalIdentifier: 'custom-application-universal-identifier',
    };

    const [standardRowItem, customRowItem] =
      getSettingsApplicationsTableRowItems({
        applications: [
          { ...STANDARD_APPLICATION, name: 'twenty-standard' },
          customApplication,
        ],
        builtInApps: [],
        currentWorkspace: {
          workspaceCustomApplication: { id: customApplication.id },
        },
      });

    expect(standardRowItem).toMatchObject({
      name: 'Standard',
      description: 'The base data model every Twenty workspace runs on.',
    });
    expect(customRowItem).toMatchObject({
      name: 'Custom',
      description: "Host your workspace's customizations and overrides.",
    });
  });

  it('shows the bundled logo of a well-known client install, which has none of its own', () => {
    const [claudeRowItem, zapierRowItem] = getSettingsApplicationsTableRowItems(
      {
        applications: [
          {
            ...OAUTH_ONLY_APPLICATION,
            id: 'claude-application-id',
            applicationRegistration: {
              id: 'claude-registration-id',
              sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
              wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
            },
          },
          OAUTH_ONLY_APPLICATION,
        ],
        builtInApps: [],
        currentWorkspace: null,
      },
    );

    expect(claudeRowItem.logoUrl).toBe(
      getBuiltInAppLogoUrl(
        BUILT_IN_MCP_CLIENT_APPS.find(({ id }) => id === 'claude')!,
      ),
    );
    expect(zapierRowItem.logoUrl).toBeUndefined();
  });
});
