import { isDefined } from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

export const isVersionUpgradeOfApplication = (
  existingApplication: ApplicationEntity | null,
): boolean =>
  isDefined(existingApplication) &&
  existingApplication.state !== ApplicationState.INSTALLING;
