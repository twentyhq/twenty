import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import {
  AnimatedEaseIn,
  IconCheck,
  isDefined,
  MainButton,
  RGBA,
} from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import {
  OnboardingStatus,
  useGetCurrentUserLazyQuery,
} from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledCheckContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${(props) => props.color};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  box-shadow: ${(props) =>
    props.color && `-4px 4px 0 -2px ${RGBA(props.color, 1)}`};
  height: 36px;
  width: 36px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export const PaymentSuccess = () => {
  const theme = useTheme();
  const navigate = useNavigateApp();
  const subscriptionStatus = useSubscriptionStatus();
  const onboardingStatus = useOnboardingStatus();
  const [getCurrentUser] = useGetCurrentUserLazyQuery();
  const setCurrentUser = useSetRecoilState(currentUserState);
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  const navigateWithSubscriptionCheck = async () => {
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
      "We're waiting for a confirmation from our payment provider (Stripe).\n" +
        'Please try again in a few seconds, sorry.',
    );
  };

  if (onboardingStatus === OnboardingStatus.Completed) {
    return <></>;
  }

  return (
    <>
      <AnimatedEaseIn>
        <StyledCheckContainer color={color}>
          <IconCheck color={color} size={24} stroke={3} />
        </StyledCheckContainer>
      </AnimatedEaseIn>
      <Title>All set!</Title>
      <SubTitle>Your account has been activated.</SubTitle>
      <StyledButtonContainer>
        <MainButton
          title="Start"
          width={200}
          onClick={navigateWithSubscriptionCheck}
        />
      </StyledButtonContainer>
    </>
  );
};
