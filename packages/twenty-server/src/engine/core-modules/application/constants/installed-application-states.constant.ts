import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

// The states in which an application counts as installed on a workspace. An
// upgrading one still is, at its previous version — leaving it out would make it
// vanish from install counts for the length of the upgrade.
export const INSTALLED_APPLICATION_STATES = [
  ApplicationState.INSTALLED,
  ApplicationState.UPGRADING,
];
