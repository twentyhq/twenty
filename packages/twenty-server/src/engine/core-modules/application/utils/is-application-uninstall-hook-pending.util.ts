import { isDefined } from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export type ApplicationUninstallHookState = Pick<
  ApplicationEntity,
  'uninstallLogicFunctionId' | 'uninstallHookCompletedForRequestedAt'
>;

export const isApplicationUninstallHookPending = (
  application: ApplicationUninstallHookState,
  uninstallRequestedAt: Date,
): boolean =>
  isDefined(application.uninstallLogicFunctionId) &&
  (!isDefined(application.uninstallHookCompletedForRequestedAt) ||
    application.uninstallHookCompletedForRequestedAt.getTime() <
      uninstallRequestedAt.getTime());
