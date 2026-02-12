import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingModalCircularIcon } from '@/onboarding/components/OnboardingModalCircularIcon';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { AnimatedEaseIn } from 'twenty-ui/utilities';
import { useGetCurrentUserLazyQuery } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledModalContent = styled(Modal.Content)`
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const PaymentSuccess = () => {
  const navigate = useNavigateApp();
  const subscriptionStatus = useSubscriptionStatus();
  const [getCurrentUser] = useGetCurrentUserLazyQuery();
  const setCurrentUser = useSetRecoilState(currentUserState);
  const [isLoading, setIsLoading] = useState(false);
  const navigateWithSubscriptionCheck = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isDefined(subscriptionStatus)) {
        navigate(AppPath.CreateWorkspace);
        return;
      }

      const result = await getCurrentUser({ fetchPolicy: 'network-only' });
      const currentUser = result.data?.currentUser;
      const refreshedSubscriptionStatus =
        currentUser?.currentWorkspace?.currentBillingSubscription?.status;

      if (isDefined(currentUser) && isDefined(refreshedSubscriptionStatus)) {
        setCurrentUser(currentUser);
        navigate(AppPath.CreateWorkspace);
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
    <StyledModalContent isVerticalCentered isHorizontalCentered>
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
    </StyledModalContent>
  );
};
