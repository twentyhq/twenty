import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { runningBillingUpdateState } from '@/settings/billing/states/runningBillingUpdateState';
import { type BillingUpdateKind } from '@/settings/billing/types/billingUpdateKind.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type BillingUpdate =
  | Pick<
      CurrentWorkspace,
      'billingSubscriptions' | 'currentBillingSubscription'
    >
  | null
  | undefined;

type UseRunBillingUpdateParams = {
  kind: BillingUpdateKind;
  mutate: () => Promise<BillingUpdate>;
};

type RunBillingUpdateParams = {
  getErrorMessage: () => string;
  getSuccessMessage: () => string;
};

export const useRunBillingUpdate = ({
  kind,
  mutate,
}: UseRunBillingUpdateParams) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const store = useStore();
  const runningBillingUpdate = useAtomStateValue(runningBillingUpdateState);

  const runBillingUpdate = async ({
    getErrorMessage,
    getSuccessMessage,
  }: RunBillingUpdateParams) => {
    if (isDefined(store.get(runningBillingUpdateState.atom))) {
      return;
    }

    store.set(runningBillingUpdateState.atom, kind);

    try {
      const billingUpdate = await mutate();
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        billingUpdate,
        { onBillingUpdateApplied: refetchResourceCreditUsage },
      );

      if (!isBillingUpdateApplied) {
        enqueueErrorSnackBar({ message: getErrorMessage() });
        return;
      }

      enqueueSuccessSnackBar({ message: getSuccessMessage() });
    } catch (error) {
      enqueueErrorSnackBar({ message: getErrorMessage() });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      store.set(runningBillingUpdateState.atom, null);
    }
  };

  return {
    isBillingUpdateRunning: runningBillingUpdate === kind,
    runBillingUpdate,
  };
};
