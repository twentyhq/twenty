import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const RECORDER_APPLICATION_ID = 'recorder-application-id';
const NOTETAKER_APPLICATION_ID = 'notetaker-application-id';
const UNINSTALLED_APPLICATION_ID = 'uninstalled-application-id';

const buildInstalledApplication = (id: string, name: string) => ({
  id,
  name,
  universalIdentifier: `${id}-universal-identifier`,
  logoUrl: null,
});

const buildSettingsMenuItem = ({
  universalIdentifier,
  applicationId,
  position = 0,
  scope = SettingsMenuItemScope.USER,
}: {
  universalIdentifier: string;
  applicationId: string;
  position?: number;
  scope?: SettingsMenuItemScope;
}) => ({
  id: `${universalIdentifier}-id`,
  universalIdentifier,
  applicationId,
  frontComponentId: `${universalIdentifier}-front-component-id`,
  title: universalIdentifier,
  icon: null,
  position,
  scope,
});

const buildVariable = ({
  key,
  value = '',
  isDeprecated = false,
}: {
  key: string;
  value?: string;
  isDeprecated?: boolean;
}) => ({
  key,
  value,
  isDeprecated,
  label: '',
  description: '',
  isSecret: false,
  isRequired: false,
  type: 'TEXT',
  options: null,
});

const INSTALLED_APPLICATIONS = [
  buildInstalledApplication(RECORDER_APPLICATION_ID, 'Recorder'),
  buildInstalledApplication(NOTETAKER_APPLICATION_ID, 'Notetaker'),
];

describe('getApplicationsWithPreferences', () => {
  it('should keep the server order and join each application to its installed application', () => {
    const result = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: NOTETAKER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [buildVariable({ key: 'LANGUAGE', value: 'en' })],
        },
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [buildVariable({ key: 'RECORD_MY_MEETINGS' })],
        },
      ],
      installedApplications: INSTALLED_APPLICATIONS,
    });

    expect(
      result.map(({ application }) => [application.id, application.name]),
    ).toEqual([
      [NOTETAKER_APPLICATION_ID, 'Notetaker'],
      [RECORDER_APPLICATION_ID, 'Recorder'],
    ]);
  });

  it('should keep only the user settings items, ordered by position', () => {
    const [result] = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [
            buildSettingsMenuItem({
              universalIdentifier: 'workspace-settings',
              applicationId: RECORDER_APPLICATION_ID,
              scope: SettingsMenuItemScope.WORKSPACE,
            }),
            buildSettingsMenuItem({
              universalIdentifier: 'second-user-settings',
              applicationId: RECORDER_APPLICATION_ID,
              position: 2,
            }),
            buildSettingsMenuItem({
              universalIdentifier: 'first-user-settings',
              applicationId: RECORDER_APPLICATION_ID,
              position: 1,
            }),
          ],
          variables: [],
        },
      ],
      installedApplications: INSTALLED_APPLICATIONS,
    });

    expect(
      result.settingsMenuItems.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual(['first-user-settings', 'second-user-settings']);
  });

  it('should hide deprecated variables without a value and sort the rest by key', () => {
    const [result] = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [
            buildVariable({ key: 'ZONE' }),
            buildVariable({ key: 'OLD_FLAG', isDeprecated: true }),
            buildVariable({
              key: 'LEGACY_KEY',
              value: 'mine',
              isDeprecated: true,
            }),
          ],
        },
      ],
      installedApplications: INSTALLED_APPLICATIONS,
    });

    expect(result.variables.map(({ key }) => key)).toEqual([
      'LEGACY_KEY',
      'ZONE',
    ]);
  });

  it('should leave out an application with nothing left to show', () => {
    const result = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [
            buildSettingsMenuItem({
              universalIdentifier: 'workspace-settings',
              applicationId: RECORDER_APPLICATION_ID,
              scope: SettingsMenuItemScope.WORKSPACE,
            }),
          ],
          variables: [buildVariable({ key: 'OLD_FLAG', isDeprecated: true })],
        },
      ],
      installedApplications: INSTALLED_APPLICATIONS,
    });

    expect(result).toEqual([]);
  });

  it('should leave out an application that is not installed', () => {
    const result = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: UNINSTALLED_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [buildVariable({ key: 'LANGUAGE', value: 'en' })],
        },
      ],
      installedApplications: INSTALLED_APPLICATIONS,
    });

    expect(result).toEqual([]);
  });
});
