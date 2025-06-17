import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingSubscriptionStatusCard } from '@/onboarding/components/OnboarindPaymentStatusCard';
import { AppPath } from '@/types/AppPath';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { subscriptionStatusState } from '@/workspace/states/subscriptionStatusState';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import {
  GetCurrentUserQuery,
  useGetCurrentUserLazyQuery,
} from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
const StyledLoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
`;

export const PaymentSuccess = () => {
  const navigate = useNavigateApp();
  const subscriptionStatus = useRecoilValue(subscriptionStatusState);

  const [getCurrentUser] = useGetCurrentUserLazyQuery();

  const setCurrentUser = useSetRecoilState(currentUserState);

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
      "We're waiting for a confirmation from our payment provider.\n" +
        'Please try again in a few seconds, sorry.',
    );
  };

  const { loading, refetch } = useQuery<GetCurrentUserQuery>(GET_CURRENT_USER, {
    fetchPolicy: 'no-cache',
    pollInterval: 10000, // Poll every 10 seconds
    onCompleted: async (data) => {
      const refreshedSubscriptionStatus =
        data.currentUser.currentWorkspace?.currentBillingSubscription?.status;

      if (isDefined(refreshedSubscriptionStatus)) {
        await navigateWithSubscriptionCheck();
      }
    },
  });

  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      {loading ? (
        <StyledLoaderContainer>
          <Loader />
        </StyledLoaderContainer>
      ) : (
        <OnboardingSubscriptionStatusCard
          {...{ navigateWithSubscriptionCheck, refetch }}
        />
      )}
    </Modal.Content>
  );
};
