import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

type CurrentWorkspaceBillingUpdate = Pick<
  CurrentWorkspace,
  'billingSubscriptions' | 'currentBillingSubscription'
>;

type CurrentBillingSubscription = NonNullable<
  CurrentWorkspace['currentBillingSubscription']
>;

type ApplyCurrentWorkspaceBillingUpdateOptions = {
  onBillingUpdateApplied?: () => void;
  transformCurrentBillingSubscription?: (
    currentBillingSubscription: CurrentBillingSubscription,
  ) => CurrentBillingSubscription;
};

export const useApplyCurrentWorkspaceBillingUpdate = () => {
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const applyCurrentWorkspaceBillingUpdate = (
    billingUpdate: CurrentWorkspaceBillingUpdate | null | undefined,
    options?: ApplyCurrentWorkspaceBillingUpdateOptions,
  ) => {
    const currentBillingSubscription =
      billingUpdate?.currentBillingSubscription;

    if (!isDefined(billingUpdate) || !isDefined(currentBillingSubscription)) {
      return false;
    }

    const billingSubscriptions = billingUpdate.billingSubscriptions;
    let isBillingUpdateApplied = false;

    setCurrentWorkspace((currentWorkspace) => {
      if (!isDefined(currentWorkspace)) {
        return currentWorkspace;
      }

      isBillingUpdateApplied = true;

      return {
        ...currentWorkspace,
        currentBillingSubscription:
          options?.transformCurrentBillingSubscription?.(
            currentBillingSubscription,
          ) ?? currentBillingSubscription,
        billingSubscriptions,
      };
    });

    if (!isBillingUpdateApplied) {
      return false;
    }

    options?.onBillingUpdateApplied?.();

    return true;
  };

  return {
    applyCurrentWorkspaceBillingUpdate,
  };
};
