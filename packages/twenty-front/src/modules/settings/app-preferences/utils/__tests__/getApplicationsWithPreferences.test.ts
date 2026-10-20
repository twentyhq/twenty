import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const RECORDER_APPLICATION_ID = 'recorder-application-id';
const NOTETAKER_APPLICATION_ID = 'notetaker-application-id';
const UNINSTALLED_APPLICATION_ID = 'uninstalled-application-id';

const buildInstalledApplication = ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => ({
  id,
  name,
  universalIdentifier: `${id}-universal-identifier`,
  logoUrl: null,
  createdAt: '2024-01-01T00:00:00.000Z',
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
  isRequired = false,
  isSecret = false,
}: {
  key: string;
  value?: string;
  isDeprecated?: boolean;
  isRequired?: boolean;
  isSecret?: boolean;
}) => ({
  key,
  value,
  isDeprecated,
  label: '',
  description: '',
  isSecret,
  isRequired,
  type: 'TEXT',
  options: null,
});

const CURRENT_WORKSPACE = {
  installedApplications: [
    buildInstalledApplication({
      id: RECORDER_APPLICATION_ID,
      name: 'Recorder',
    }),
    buildInstalledApplication({
      id: NOTETAKER_APPLICATION_ID,
      name: 'Notetaker',
    }),
  ],
  workspaceCustomApplication: null,
};

describe('getApplicationsWithPreferences', () => {
  it('should join each application to its installed application and sort by display name', () => {
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
      currentWorkspace: CURRENT_WORKSPACE,
    });

    expect(result.variables.map(({ key }) => key)).toEqual([
      'LEGACY_KEY',
      'ZONE',
    ]);
  });

  it('should flag the required variables the member has no value for, own or default', () => {
    const [result] = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [
            buildVariable({ key: 'WORKSPACE_ROOM', isRequired: true }),
            buildVariable({ key: 'API_TOKEN', isRequired: true }),
            buildVariable({ key: 'NICKNAME' }),
            buildVariable({
              key: 'LANGUAGE',
              value: 'en',
              isRequired: true,
            }),
            buildVariable({
              key: 'PERSONAL_API_KEY',
              value: 'sk-1********',
              isRequired: true,
              isSecret: true,
            }),
            buildVariable({
              key: 'OLD_TOKEN',
              isRequired: true,
              isDeprecated: true,
            }),
          ],
        },
      ],
      currentWorkspace: CURRENT_WORKSPACE,
    });

    expect(result.missingRequiredVariables.map(({ key }) => key)).toEqual([
      'API_TOKEN',
      'WORKSPACE_ROOM',
    ]);
  });

  it('should flag a required secret the member has not saved yet', () => {
    const [result] = getApplicationsWithPreferences({
      applicationPreferences: [
        {
          applicationId: RECORDER_APPLICATION_ID,
          settingsMenuItems: [],
          variables: [
            buildVariable({
              key: 'PERSONAL_API_KEY',
              isRequired: true,
              isSecret: true,
            }),
          ],
        },
      ],
      currentWorkspace: CURRENT_WORKSPACE,
    });

    expect(result.missingRequiredVariables.map(({ key }) => key)).toEqual([
      'PERSONAL_API_KEY',
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
      currentWorkspace: CURRENT_WORKSPACE,
    });

    expect(result).toEqual([]);
  });
});
