import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  type ApplicationVariable,
  type SettingsMenuItem,
} from '~/generated-metadata/graphql';

// A custom settings tab lays out the application variables itself, so a
// variables tab next to it would duplicate them
export const hasApplicationVariablesTab = ({
  settingsMenuItems,
  displayedApplicationVariables,
}: {
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier'>[];
  displayedApplicationVariables: Pick<ApplicationVariable, 'key'>[];
}): boolean =>
  !isNonEmptyArray(settingsMenuItems) &&
  isNonEmptyArray(displayedApplicationVariables);
