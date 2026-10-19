import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type MyApplicationPreferencesQuery } from '~/generated-metadata/graphql';

type MyApplicationPreferences =
  MyApplicationPreferencesQuery['myApplicationPreferences'][number];

export type ApplicationWithPreferences = {
  application: CurrentWorkspace['installedApplications'][number];
  settingsMenuItems: MyApplicationPreferences['settingsMenuItems'];
  variables: MyApplicationPreferences['variables'];
};
