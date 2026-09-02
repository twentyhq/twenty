import { isDefined } from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

// A row still in INSTALLING never completed an install, so an install run
// against it retries that fresh install rather than upgrading a live app.
export const isVersionUpgradeOfApplication = (
  existingApplication: ApplicationEntity | null,
): boolean =>
  isDefined(existingApplication) &&
  existingApplication.state !== ApplicationState.INSTALLING;
