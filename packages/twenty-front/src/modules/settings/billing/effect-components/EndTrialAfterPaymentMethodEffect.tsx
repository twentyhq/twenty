import { ASK_AI_THREAD_ID_QUERY_PARAM } from '@/ai/constants/AskAiThreadIdQueryParam';
import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM } from '@/settings/billing/constants/StartSubscriptionAfterPaymentMethodQueryParam';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { isEndingSubscriptionTrialPeriodState } from '@/settings/billing/states/isEndingSubscriptionTrialPeriodState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const EndTrialAfterPaymentMethodEffect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subscriptionStatus = useSubscriptionStatus();
  const { endTrialPeriod } = useEndSubscriptionTrialPeriod();
  const { openAskAiThread } = useOpenAskAiThread();
  const { enqueueErrorSnackBar } = useSnackBar();

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

    if (jotaiStore.get(isEndingSubscriptionTrialPeriodState.atom) === true) {
      return;
    }
    jotaiStore.set(isEndingSubscriptionTrialPeriodState.atom, true);

    try {
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
    } finally {
      cleanUpQueryParams();
      jotaiStore.set(isEndingSubscriptionTrialPeriodState.atom, false);
    }
  };

  useEffect(() => {
    if (!isDefined(subscriptionStatus)) {
      return;
    }
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
