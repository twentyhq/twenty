import { ASK_AI_THREAD_ID_QUERY_PARAM } from '@/ai/constants/AskAiThreadIdQueryParam';
import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM } from '@/settings/billing/constants/StartSubscriptionAfterPaymentMethodQueryParam';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

// Mounted only by EndTrialAfterPaymentMethodGater, i.e. once the card-less trial
// user returns from the Stripe payment-method-update portal. It ends the trial
// in place (no redirection) and reopens the Ask AI thread they came from.
export const EndTrialAfterPaymentMethodEffect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subscriptionStatus = useSubscriptionStatus();
  const { endTrialPeriod } = useEndSubscriptionTrialPeriod();
  const { openAskAiThread } = useOpenAskAiThread();
  const { enqueueErrorSnackBar } = useSnackBar();

  // A ref is used so the activation runs once even though StrictMode
  // double-invokes effects on mount.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    const searchParams = new URLSearchParams(location.search);
    const askAiThreadId = searchParams.get(ASK_AI_THREAD_ID_QUERY_PARAM);

    const cleanUpQueryParams = () => {
      searchParams.delete(START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM);
      searchParams.delete(ASK_AI_THREAD_ID_QUERY_PARAM);

      const cleanedSearch = searchParams.toString();

      navigate(
        `${location.pathname}${cleanedSearch.length > 0 ? `?${cleanedSearch}` : ''}${location.hash}`,
        { replace: true },
      );
    };

    const startSubscription = async () => {
      if (subscriptionStatus !== SubscriptionStatus.Trialing) {
        cleanUpQueryParams();
        return;
      }

      const { success, hasPaymentMethod } = await endTrialPeriod({
        skipPaymentMethodRedirect: true,
      });

      if (success) {
        if (isNonEmptyString(askAiThreadId)) {
          openAskAiThread(askAiThreadId);
        }
      } else if (hasPaymentMethod === false) {
        enqueueErrorSnackBar({
          message: t`No payment method found. Please update your billing details.`,
        });
      }

      cleanUpQueryParams();
    };

    void startSubscription();
  }, [
    location.search,
    location.pathname,
    location.hash,
    navigate,
    subscriptionStatus,
    endTrialPeriod,
    openAskAiThread,
    enqueueErrorSnackBar,
  ]);

  return null;
};
