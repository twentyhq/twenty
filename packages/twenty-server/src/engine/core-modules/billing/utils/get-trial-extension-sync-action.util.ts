/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type TrialExtensionSyncAction } from 'src/engine/core-modules/billing/types/trial-extension-sync-action.type';

export const getTrialExtensionSyncAction = ({
  activeTrialExtensionEndsAt,
  previousTrialEnd,
  isTrialing,
  trialEnd,
}: {
  activeTrialExtensionEndsAt: Date | null;
  previousTrialEnd: Date | null;
  isTrialing: boolean;
  trialEnd: Date | null;
}): TrialExtensionSyncAction => {
  if (!isTrialing || !isDefined(trialEnd)) {
    return isDefined(activeTrialExtensionEndsAt)
      ? { type: 'END' }
      : { type: 'NONE' };
  }

  if (isDefined(activeTrialExtensionEndsAt)) {
    if (trialEnd.getTime() === activeTrialExtensionEndsAt.getTime()) {
      return { type: 'NONE' };
    }

    return trialEnd > activeTrialExtensionEndsAt
      ? { type: 'START', endsAt: trialEnd }
      : { type: 'END' };
  }

  return isDefined(previousTrialEnd) && trialEnd > previousTrialEnd
    ? { type: 'START', endsAt: trialEnd }
    : { type: 'NONE' };
};
