import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getAccountGroupApplicationsWithSettings } from '@/settings/app-preferences/utils/getAccountGroupApplicationsWithSettings';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const buildApplicationWithPreferences = ({
  applicationId,
  hasSettingsMenuItem,
}: {
  applicationId: string;
  hasSettingsMenuItem: boolean;
}): ApplicationWithPreferences => ({
  application: {
    id: applicationId,
    name: applicationId,
    universalIdentifier: `${applicationId}-universal-identifier`,
    logoUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  settingsMenuItems: hasSettingsMenuItem
    ? [
        {
          __typename: 'SettingsMenuItem',
          id: `${applicationId}-settings-menu-item-id`,
          universalIdentifier: `${applicationId}-settings-menu-item`,
          applicationId,
          frontComponentId: `${applicationId}-front-component-id`,
          title: 'My settings',
          icon: null,
          position: 0,
          scope: SettingsMenuItemScope.USER,
          slug: null,
        },
      ]
    : [],
  variables: [],
  missingRequiredVariables: [],
  connectionProviders: [],
});

const applicationsWithPreferences = [
  buildApplicationWithPreferences({
    applicationId: 'recorder',
    hasSettingsMenuItem: true,
  }),
  buildApplicationWithPreferences({
    applicationId: 'notetaker',
    hasSettingsMenuItem: true,
  }),
  buildApplicationWithPreferences({
    applicationId: 'archived-notetaker',
    hasSettingsMenuItem: true,
  }),
  buildApplicationWithPreferences({
    applicationId: 'variables-only',
    hasSettingsMenuItem: false,
  }),
];

describe('getAccountGroupApplicationsWithSettings', () => {
  it('keeps applications connected with the account that have settings', () => {
    const applicationsWithSettings = getAccountGroupApplicationsWithSettings({
      group: {
        appAccounts: [
          { applicationId: 'recorder', archivedAt: null },
          {
            applicationId: 'archived-notetaker',
            archivedAt: '2026-09-02T00:00:00.000Z',
          },
          { applicationId: 'variables-only', archivedAt: null },
        ],
      },
      applicationsWithPreferences,
    });

    expect(
      applicationsWithSettings.map(({ application }) => application.id),
    ).toEqual(['recorder']);
  });

  it('returns nothing for an account without app connections', () => {
    expect(
      getAccountGroupApplicationsWithSettings({
        group: { appAccounts: [] },
        applicationsWithPreferences,
      }),
    ).toEqual([]);
  });
});
