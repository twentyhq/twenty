import { isDefined } from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

const NEVER_COMPLETED_INSTALL_STATES = [
  ApplicationState.INSTALLING,
  ApplicationState.FAILED,
];

export const isVersionUpgradeOfApplication = (
  existingApplication: ApplicationEntity | null,
): boolean =>
  isDefined(existingApplication) &&
  !NEVER_COMPLETED_INSTALL_STATES.includes(existingApplication.state);
