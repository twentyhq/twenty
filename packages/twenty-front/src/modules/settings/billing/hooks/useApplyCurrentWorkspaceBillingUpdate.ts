import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useStore } from 'jotai';
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
  const store = useStore();

  const applyCurrentWorkspaceBillingUpdate = (
    billingUpdate: CurrentWorkspaceBillingUpdate | null | undefined,
    options?: ApplyCurrentWorkspaceBillingUpdateOptions,
  ) => {
    const currentBillingSubscription =
      billingUpdate?.currentBillingSubscription;

    if (!isDefined(billingUpdate) || !isDefined(currentBillingSubscription)) {
      return false;
    }

    const currentWorkspace = store.get(currentWorkspaceState.atom);

    if (!isDefined(currentWorkspace)) {
      return false;
    }

    store.set(currentWorkspaceState.atom, {
      ...currentWorkspace,
      currentBillingSubscription:
        options?.transformCurrentBillingSubscription?.(
          currentBillingSubscription,
        ) ?? currentBillingSubscription,
      billingSubscriptions: billingUpdate.billingSubscriptions,
    });

    options?.onBillingUpdateApplied?.();

    return true;
  };

  return {
    applyCurrentWorkspaceBillingUpdate,
  };
};
