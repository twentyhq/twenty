import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const RECORDER_APPLICATION_ID = 'recorder-application-id';
const NOTETAKER_APPLICATION_ID = 'notetaker-application-id';
const UNINSTALLED_APPLICATION_ID = 'uninstalled-application-id';

const buildApplication = ({ id, name }: { id: string; name: string }) => ({
  id,
  name,
  universalIdentifier: `${id}-universal-identifier`,
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

const APPLICATIONS = [
  buildApplication({ id: RECORDER_APPLICATION_ID, name: 'Recorder' }),
  buildApplication({ id: NOTETAKER_APPLICATION_ID, name: 'Notetaker' }),
];

const CURRENT_WORKSPACE = { workspaceCustomApplication: null };

describe('getApplicationsWithPreferences', () => {
  it('should join each application to the installed application and sort by display name', () => {
    const result = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [buildVariable({ key: 'RECORD_MY_MEETINGS' })],
        },
        {
          applicationId: NOTETAKER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [buildVariable({ key: 'LANGUAGE', value: 'en' })],
        },
      ],
      applications: APPLICATIONS,
      currentWorkspace: CURRENT_WORKSPACE,
    });

    expect(
      result.map(({ application }) => [application.id, application.name]),
    ).toEqual([
      [NOTETAKER_APPLICATION_ID, 'Notetaker'],
      [RECORDER_APPLICATION_ID, 'Recorder'],
    ]);
  });

  it('should order the settings items by position', () => {
    const [result] = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [
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
      applications: APPLICATIONS,
      currentWorkspace: CURRENT_WORKSPACE,
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
      applications: APPLICATIONS,
      currentWorkspace: CURRENT_WORKSPACE,
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
          settingsMenuItems: [],
          variables: [buildVariable({ key: 'OLD_FLAG', isDeprecated: true })],
        },
      ],
      applications: APPLICATIONS,
      currentWorkspace: CURRENT_WORKSPACE,
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
      applications: APPLICATIONS,
      currentWorkspace: CURRENT_WORKSPACE,
    });

    expect(result).toEqual([]);
  });
});
