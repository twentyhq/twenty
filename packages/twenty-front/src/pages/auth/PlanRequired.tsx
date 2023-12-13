import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { billingState } from '@/client-config/states/billingState';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

export const PlanRequired = () => {
  const onboardingStatus = useOnboardingStatus();
  const { billingUrl } = useRecoilValue(billingState);

  const handleButtonClick = () => {
    billingUrl && window.location.replace(billingUrl);
  };

  useScopedHotkeys('enter', handleButtonClick, PageHotkeyScope.PlanRequired, [
    handleButtonClick,
  ]);

  if (onboardingStatus === OnboardingStatus.Completed) {
    return null;
  }

  return (
    <>
      <Title>Plan required</Title>
      <SubTitle>
        Please select a subscription plan before proceeding to sign in.
      </SubTitle>
      <StyledButtonContainer>
        <MainButton title="Get started" onClick={handleButtonClick} fullWidth />
      </StyledButtonContainer>
    </>
  );
};
