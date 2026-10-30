import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import {
  NPM_APPLICATION,
  OAUTH_ONLY_APPLICATION,
  STANDARD_APPLICATION,
} from '@/settings/applications/testing/settingsApplicationsTableFixtures';
import { getSettingsApplicationsTableRowItems } from '@/settings/applications/utils/getSettingsApplicationsTableRowItems';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

describe('getSettingsApplicationsTableRowItems', () => {
  it('lists the standard app, then built-in account apps, then the other apps with OAuth-only apps last', () => {
    const rowItems = getSettingsApplicationsTableRowItems({
      applications: [
        OAUTH_ONLY_APPLICATION,
        NPM_APPLICATION,
        STANDARD_APPLICATION,
      ],
      builtInAccountApps: BUILT_IN_ACCOUNT_APPS,
    });

    expect(rowItems.map(({ id }) => id)).toEqual([
      STANDARD_APPLICATION.id,
      'google',
      'outlook',
      'imap',
      NPM_APPLICATION.id,
      OAUTH_ONLY_APPLICATION.id,
    ]);
  });

  it('keeps the existing order without built-in account apps', () => {
    const rowItems = getSettingsApplicationsTableRowItems({
      applications: [
        NPM_APPLICATION,
        OAUTH_ONLY_APPLICATION,
        STANDARD_APPLICATION,
      ],
      builtInAccountApps: [],
    });

    expect(rowItems.map(({ id }) => id)).toEqual([
      NPM_APPLICATION.id,
      STANDARD_APPLICATION.id,
      OAUTH_ONLY_APPLICATION.id,
    ]);
  });

  it('gives installed apps their source type and built-in account apps none', () => {
    const [googleRowItem, npmRowItem] = getSettingsApplicationsTableRowItems({
      applications: [NPM_APPLICATION],
      builtInAccountApps: BUILT_IN_ACCOUNT_APPS.slice(0, 1),
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
});
