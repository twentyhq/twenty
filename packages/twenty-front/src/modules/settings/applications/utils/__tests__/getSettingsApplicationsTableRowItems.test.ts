import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import {
  CHATGPT_CONNECTABLE_APP,
  CLAUDE_CONNECTABLE_APP,
} from '@/settings/app-preferences/testing/connectableAppFixtures';
import {
  NPM_APPLICATION,
  OAUTH_ONLY_APPLICATION,
  STANDARD_APPLICATION,
} from '@/settings/applications/testing/settingsApplicationsTableFixtures';
import { getSettingsApplicationsTableRowItems } from '@/settings/applications/utils/getSettingsApplicationsTableRowItems';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

describe('getSettingsApplicationsTableRowItems', () => {
  it('lists the standard app, then built-in and connectable apps, then the other apps with OAuth-only apps last', () => {
    const rowItems = getSettingsApplicationsTableRowItems({
      applications: [
        OAUTH_ONLY_APPLICATION,
        NPM_APPLICATION,
        STANDARD_APPLICATION,
      ],
      builtInApps: BUILT_IN_ACCOUNT_APPS,
      connectableApps: [CHATGPT_CONNECTABLE_APP, CLAUDE_CONNECTABLE_APP],
      currentWorkspace: null,
    });

    expect(rowItems.map(({ id }) => id)).toEqual([
      STANDARD_APPLICATION.id,
      'google',
      'outlook',
      'imap',
      CHATGPT_CONNECTABLE_APP.id,
      CLAUDE_CONNECTABLE_APP.id,
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

  it('labels an install by how it was installed, and one without a registration as built-in', () => {
    const [standardRowItem, claudeRowItem] =
      getSettingsApplicationsTableRowItems({
        applications: [
          {
            ...STANDARD_APPLICATION,
            sourceType: ApplicationRegistrationSourceType.LOCAL,
          },
          {
            id: 'claude-application-id',
            name: 'Claude',
            universalIdentifier: 'claude-universal-identifier',
            sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
            applicationRegistration: {
              id: 'claude-registration-id',
              sourceType: ApplicationRegistrationSourceType.NPM,
              oAuthIdentityUniversalIdentifier: 'claude-universal-identifier',
            },
          },
        ],
        builtInApps: [],
        currentWorkspace: null,
      });

    expect(standardRowItem.sourceType).toBeUndefined();
    expect(claudeRowItem.sourceType).toBe(
      ApplicationRegistrationSourceType.OAUTH_ONLY,
    );
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
});
