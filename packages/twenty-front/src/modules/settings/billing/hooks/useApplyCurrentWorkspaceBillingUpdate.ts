import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
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
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const applyCurrentWorkspaceBillingUpdate = (
    billingUpdate: CurrentWorkspaceBillingUpdate | null | undefined,
    options?: ApplyCurrentWorkspaceBillingUpdateOptions,
  ) => {
    if (
      !isDefined(currentWorkspace) ||
      !isDefined(billingUpdate?.currentBillingSubscription)
    ) {
      return false;
    }

    setCurrentWorkspace({
      ...currentWorkspace,
      currentBillingSubscription:
        options?.transformCurrentBillingSubscription?.(
          billingUpdate.currentBillingSubscription,
        ) ?? billingUpdate.currentBillingSubscription,
      billingSubscriptions: billingUpdate.billingSubscriptions,
    });

    options?.onBillingUpdateApplied?.();

    return true;
  };

  return {
    applyCurrentWorkspaceBillingUpdate,
  };
};
