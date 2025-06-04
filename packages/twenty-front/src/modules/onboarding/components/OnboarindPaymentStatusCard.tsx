import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';

import { IconAlertCircle, IconCheck } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { RGBA } from 'twenty-ui/theme';
import { AnimatedEaseIn } from 'twenty-ui/utilities';

import { subscriptionStatusState } from '@/workspace/states/subscriptionStatusState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { GetCurrentUserQueryResult } from '~/generated/graphql';

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

type OnboardingSubscriptionStatusCardProps = {
  navigateWithSubscriptionCheck: () => Promise<void>;
  refetch: GetCurrentUserQueryResult['refetch'];
};

export const OnboardingSubscriptionStatusCard = ({
  refetch,
  navigateWithSubscriptionCheck,
}: OnboardingSubscriptionStatusCardProps) => {
  const subscriptionStatus = useRecoilValue(subscriptionStatusState);

  const [isOnRetryCooldown, setIsOnRetryCooldown] = useState(false);

  const theme = useTheme();

  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  return (
    <>
      <AnimatedEaseIn>
        {isDefined(subscriptionStatus) ? (
          <StyledCheckContainer color={color}>
            <IconCheck color={color} size={24} stroke={3} />
          </StyledCheckContainer>
        ) : (
          <IconAlertCircle />
        )}
      </AnimatedEaseIn>
      <Title>{isDefined(subscriptionStatus) ? 'All set!' : 'Hold up!'} </Title>
      <SubTitle>
        {isDefined(subscriptionStatus)
          ? 'Your account has been activated.'
          : "We're waiting for a confirmation from our payment provider."}
      </SubTitle>
      <StyledButtonContainer>
        <MainButton
          title={isDefined(subscriptionStatus) ? 'Start' : 'Reload'}
          width={200}
          disabled={isOnRetryCooldown}
          onClick={
            isDefined(subscriptionStatus)
              ? navigateWithSubscriptionCheck
              : async () => {
                  setIsOnRetryCooldown(true);
                  setTimeout(() => {
                    setIsOnRetryCooldown(false);
                  }, 30000); // Disable for 30 seconds
                  await refetch();
                }
          }
        />
      </StyledButtonContainer>
    </>
  );
};
