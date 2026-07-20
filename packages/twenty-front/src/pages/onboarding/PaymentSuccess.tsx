import { SubTitle } from '@/auth/components/SubTitle';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingAnimatedReveal } from '@/onboarding/components/OnboardingAnimatedReveal';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { useShowWelcomeAnimationAfterOnboardingCheckout } from '@/onboarding/hooks/useShowWelcomeAnimationAfterOnboardingCheckout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLazyQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { GetCurrentUserDocument } from '~/generated-metadata/graphql';

const SUBSCRIPTION_CONFIRMATION_POLL_INTERVAL_MS = 2000;
const SUBSCRIPTION_CONFIRMATION_MAX_ATTEMPTS = 30;

const StyledRetryButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 200px;
`;

export const PaymentSuccess = () => {
  const subscriptionStatus = useSubscriptionStatus();
  const [getCurrentUser] = useLazyQuery(GetCurrentUserDocument, {
    fetchPolicy: 'network-only',
  });
  const setCurrentUser = useSetAtomState(currentUserState);
  const showWelcomeAnimationAfterOnboardingCheckout =
    useShowWelcomeAnimationAfterOnboardingCheckout();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [confirmationRunIndex, setConfirmationRunIndex] = useState(0);

  useEffect(() => {
    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const confirmSubscription = async () => {
      if (cancelled) {
        return;
      }

      if (isDefined(subscriptionStatus)) {
        showWelcomeAnimationAfterOnboardingCheckout();
        return;
      }

      const result = await getCurrentUser();

      if (cancelled) {
        return;
      }

      const currentUser = result.data?.currentUser;
      const refreshedSubscriptionStatus =
        currentUser?.currentWorkspace?.currentBillingSubscription?.status;

      if (isDefined(currentUser) && isDefined(refreshedSubscriptionStatus)) {
        setCurrentUser(currentUser);
        showWelcomeAnimationAfterOnboardingCheckout();
        return;
      }

      attempts += 1;

      if (attempts >= SUBSCRIPTION_CONFIRMATION_MAX_ATTEMPTS) {
        setHasTimedOut(true);
        enqueueErrorSnackBar({
          message: t`We're still waiting for a confirmation from our payment provider (Stripe). Please refresh in a few seconds.`,
        });
        return;
      }

      timeoutId = setTimeout(
        () => void confirmSubscription(),
        SUBSCRIPTION_CONFIRMATION_POLL_INTERVAL_MS,
      );
    };

    void confirmSubscription();

    return () => {
      cancelled = true;
      if (isDefined(timeoutId)) {
        clearTimeout(timeoutId);
      }
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmationRunIndex, subscriptionStatus]);

  const handleRetry = () => {
    setHasTimedOut(false);
    setConfirmationRunIndex((previous) => previous + 1);
  };

  const transition = useOnboardingMotionTransition();

  return (
    <OnboardingVerifyLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={hasTimedOut ? 'timed-out' : 'confirming'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <SubTitle>
            {hasTimedOut
              ? t`We're still waiting for the payment confirmation`
              : t`Confirming your payment`}
          </SubTitle>
        </motion.div>
      </AnimatePresence>
      <OnboardingAnimatedReveal isVisible={hasTimedOut}>
        <StyledRetryButtonContainer>
          <MainButton title={t`Retry`} onClick={handleRetry} fullWidth />
        </StyledRetryButtonContainer>
      </OnboardingAnimatedReveal>
    </OnboardingVerifyLayout>
  );
};
