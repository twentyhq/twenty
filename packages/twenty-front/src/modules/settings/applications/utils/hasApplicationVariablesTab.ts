import { isNonEmptyArray } from 'twenty-shared/utils';

// A custom settings tab lays out the application variables itself, so a
// variables tab next to it would duplicate them
export const hasApplicationVariablesTab = ({
  settingsMenuItems,
  displayedApplicationVariables,
}: {
  settingsMenuItems: unknown[];
  displayedApplicationVariables: unknown[];
}): boolean =>
  !isNonEmptyArray(settingsMenuItems) &&
  isNonEmptyArray(displayedApplicationVariables);
