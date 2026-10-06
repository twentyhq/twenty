import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { CREDIT_TOP_UP_GRANT_POLLING_INTERVAL_MS } from '@/settings/billing/constants/CreditTopUpGrantPollingIntervalMs';
import { CREDIT_TOP_UP_GRANT_POLLING_MAX_ATTEMPTS } from '@/settings/billing/constants/CreditTopUpGrantPollingMaxAttempts';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { isCreditTopUpRefusedBeforeCharge } from '@/settings/billing/utils/isCreditTopUpRefusedBeforeCharge';
import { waitForCreditTopUpGrant } from '@/settings/billing/utils/waitForCreditTopUpGrant';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  BillingInvoicePaymentStatus,
  BillingProductKey,
  GetAiChatUsageDocument,
  GetResourceCreditUsageDocument,
  PurchaseCreditTopUpDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';
import { sleep } from '~/utils/sleep';

export const usePurchaseCreditTopUp = ({ dialogId }: { dialogId: string }) => {
  const client = useApolloClient();
  const { closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const { loadCurrentUser } = useLoadCurrentUser();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();

  const [purchaseCreditTopUpMutation, { loading: isPurchasing }] = useMutation(
    PurchaseCreditTopUpDocument,
    {
      refetchQueries: [GetResourceCreditUsageDocument, GetAiChatUsageDocument],
    },
  );

  const fetchTotalGrantedCredits = async () => {
    const { data } = await client.query({
      query: GetResourceCreditUsageDocument,
      fetchPolicy: 'network-only',
    });

    return data?.getResourceCreditUsage.find(
      ({ productKey }) => productKey === BillingProductKey.RESOURCE_CREDIT,
    )?.totalGrantedCredits;
  };

  const purchaseCreditTopUp = async ({
    creditAmount,
    idempotencyKey,
  }: {
    creditAmount: number;
    idempotencyKey: string;
  }) => {
    try {
      const { data } = await purchaseCreditTopUpMutation({
        variables: { creditAmount, idempotencyKey },
      });

      const creditTopUp = data?.purchaseCreditTopUp;

      if (!isDefined(creditTopUp)) {
        enqueueToast({ variant: 'error', children: t`An error occurred.` });

        return { creditTopUp: null, isRefusedBeforeCharge: false };
      }

      if (creditTopUp.status === BillingInvoicePaymentStatus.REQUIRES_ACTION) {
        return { creditTopUp, isRefusedBeforeCharge: false };
      }

      // Closed first: clearing the credit cap unmounts the banner that may host this dialog
      closeDialog(dialogId);

      if (creditTopUp.status === BillingInvoicePaymentStatus.PROCESSING) {
        enqueueToast({
          variant: 'info',
          children: t`Your payment is processing. The credits are added as soon as it succeeds.`,
        });

        return { creditTopUp, isRefusedBeforeCharge: false };
      }

      applyCurrentWorkspaceBillingUpdate(creditTopUp);
      enqueueToast({
        variant: 'success',
        children: t`${creditAmount} credits added.`,
      });

      return { creditTopUp, isRefusedBeforeCharge: false };
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }

      return {
        creditTopUp: null,
        isRefusedBeforeCharge: isCreditTopUpRefusedBeforeCharge(error),
      };
    }
  };

  const warnPaymentNotConfirmed = () =>
    enqueueToast({
      variant: 'warning',
      children: t`Your payment is not confirmed yet. The credits are added as soon as it succeeds.`,
      action: (
        <NavigationButton
          to={getSettingsPath(SettingsPath.Billing)}
          variant="ghost"
          size="sm"
        >
          {t`Go to billing`}
        </NavigationButton>
      ),
    });

  const completePaymentAndWaitForCredits = async (hostedInvoiceUrl: string) => {
    window.open(hostedInvoiceUrl, '_blank', 'noopener,noreferrer');
    closeDialog(dialogId);

    const initialTotalGrantedCredits = await fetchTotalGrantedCredits().catch(
      () => undefined,
    );

    if (!isDefined(initialTotalGrantedCredits)) {
      warnPaymentNotConfirmed();

      return;
    }

    const isGranted = await waitForCreditTopUpGrant({
      fetchTotalGrantedCredits,
      initialTotalGrantedCredits,
      waitBeforeAttempt: () => sleep(CREDIT_TOP_UP_GRANT_POLLING_INTERVAL_MS),
      maxAttempts: CREDIT_TOP_UP_GRANT_POLLING_MAX_ATTEMPTS,
    });

    if (!isGranted) {
      warnPaymentNotConfirmed();

      return;
    }

    try {
      await loadCurrentUser();
      await client.refetchQueries({ include: [GetAiChatUsageDocument] });
    } catch {
      logError(
        'Credits were added but the workspace billing state could not be refreshed',
      );
    }

    enqueueToast({ variant: 'success', children: t`Credits added.` });
  };

  return {
    purchaseCreditTopUp,
    completePaymentAndWaitForCredits,
    isPurchasing,
  };
};
