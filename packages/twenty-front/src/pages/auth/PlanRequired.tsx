import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { billingState } from '@/client-config/states/billingState';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { LargeMainButton } from '@/ui/input/button/components/LargeMainButton.tsx';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

export const PlanRequired = () => {
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
      <Title>Plan required</Title>
      <SubTitle>
        Please select a subscription plan before proceeding to sign in.
      </SubTitle>
      <LargeMainButton title="Get started" onClick={handleButtonClick} />
    </>
  );
};
