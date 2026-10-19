import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { type MyApplicationPreferencesQuery } from '~/generated-metadata/graphql';

type MyApplicationPreferences =
  MyApplicationPreferencesQuery['myApplicationPreferences'][number];

export type ApplicationWithPreferences = {
  application: FlatApplication;
  settingsMenuItems: MyApplicationPreferences['settingsMenuItems'];
  variables: MyApplicationPreferences['variables'];
};
