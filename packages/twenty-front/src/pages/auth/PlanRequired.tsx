import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { billingState } from '@/client-config/states/billingState';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import useI18n from '@/ui/i18n/useI18n';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

export const PlanRequired = () => {
  const { translate } = useI18n('translations');
  const billing = useRecoilValue(billingState);

  const handleButtonClick = () => {
    billing?.billingUrl && window.location.replace(billing.billingUrl);
  };

  useScopedHotkeys('enter', handleButtonClick, PageHotkeyScope.PlanRequired, [
    handleButtonClick,
  ]);

  return (
    <>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title>{translate('planRequired')}</Title>
      <SubTitle>{translate('planRequiredDes')}</SubTitle>
      <StyledButtonContainer>
        <MainButton
          title={translate('getStarted')}
          onClick={handleButtonClick}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
};
