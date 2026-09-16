import {
  type CurrentWorkspaceBillingUpdate,
  useApplyCurrentWorkspaceBillingUpdate,
} from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { isBillingUpdateRunningState } from '@/settings/billing/states/isBillingUpdateRunningState';
import { useToast } from 'twenty-ui/primitives/feedback';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useStore } from 'jotai';

export const useRunBillingUpdate = ({
  mutate,
}: {
  mutate: () => Promise<CurrentWorkspaceBillingUpdate | null | undefined>;
}) => {
  const { enqueueToast } = useToast();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const store = useStore();

  const runBillingUpdate = async ({
    getErrorMessage,
    getSuccessMessage,
  }: {
    getErrorMessage: () => string;
    getSuccessMessage: () => string;
  }) => {
    if (store.get(isBillingUpdateRunningState.atom)) {
      return;
    }

    store.set(isBillingUpdateRunningState.atom, true);

    try {
      const billingUpdate = await mutate();
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        billingUpdate,
        { onBillingUpdateApplied: refetchResourceCreditUsage },
      );

      if (!isBillingUpdateApplied) {
        enqueueToast({ variant: 'error', children: getErrorMessage() });
        return;
      }

      enqueueToast({ variant: 'success', children: getSuccessMessage() });
    } catch (error) {
      enqueueToast({ variant: 'error', children: getErrorMessage() });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      store.set(isBillingUpdateRunningState.atom, false);
    }
  };

  return { runBillingUpdate };
};
