import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingModalCircularIcon } from '@/onboarding/components/OnboardingModalCircularIcon';
import { ModalContent } from 'twenty-ui/surfaces';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { AnimatedEaseIn } from 'twenty-ui/layout';
import { useLazyQuery } from '@apollo/client/react';
import {
  GetCurrentUserDocument,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

export const PaymentSuccess = () => {
  const navigate = useNavigateApp();
  const [getCurrentUser] = useLazyQuery(GetCurrentUserDocument, {
    fetchPolicy: 'network-only',
  });
  const setCurrentUser = useSetAtomState(currentUserState);
  const [isLoading, setIsLoading] = useState(false);
  const navigateWithSubscriptionCheck = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // The inline payment flow persists the subscription before the card is
      // confirmed, so its existence no longer proves payment succeeded. Rely on
      // the server-computed onboarding status, which only advances past
      // PLAN_REQUIRED once a required payment method has been confirmed.
      const result = await getCurrentUser();
      const currentUser = result.data?.currentUser;

      if (
        isDefined(currentUser) &&
        isDefined(currentUser.onboardingStatus) &&
        currentUser.onboardingStatus !== OnboardingStatus.PLAN_REQUIRED
      ) {
        setCurrentUser(currentUser);
        navigate(AppPath.WorkspaceActivation);
        return;
      }

      throw new Error(
        t`We're waiting for a confirmation from our payment provider (Stripe).\nPlease try again in a few seconds, sorry.`,
      );
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <ModalContent gap={8} isVerticallyCentered isHorizontallyCentered>
      <AnimatedEaseIn>
        <OnboardingModalCircularIcon Icon={IconCheck} />
      </AnimatedEaseIn>
      <StyledTitleContainer>
        <Title noMarginTop>{t`All set!`}</Title>
        <SubTitle>{t`Your account has been activated.`}</SubTitle>
      </StyledTitleContainer>
      <MainButton
        title={t`Start`}
        width={200}
        onClick={navigateWithSubscriptionCheck}
        Icon={() => (isLoading ? <Loader /> : null)}
        disabled={isLoading}
      />
    </ModalContent>
  );
};
