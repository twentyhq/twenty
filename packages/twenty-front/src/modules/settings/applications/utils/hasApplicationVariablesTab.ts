import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  type ApplicationVariable,
  type SettingsMenuItem,
} from '~/generated-metadata/graphql';

// A custom settings tab already lays out the variables
export const hasApplicationVariablesTab = ({
  settingsMenuItems,
  displayedApplicationVariables,
}: {
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier'>[];
  displayedApplicationVariables: Pick<ApplicationVariable, 'key'>[];
}): boolean =>
  !isNonEmptyArray(settingsMenuItems) &&
  isNonEmptyArray(displayedApplicationVariables);
