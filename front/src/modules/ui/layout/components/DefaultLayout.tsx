import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilState, useRecoilValue } from 'recoil';

import { AuthModal } from '@/auth/components/Modal';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { NavbarAnimatedContainer } from '@/ui/navbar/components/NavbarAnimatedContainer';
import { MOBILE_VIEWPORT } from '@/ui/themes/themes';
import { AppNavbar } from '~/AppNavbar';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { CompaniesMockMode } from '~/pages/companies/CompaniesMockMode';

import { AppPath } from '../../../types/AppPath';
import { useIsPageLoading } from '../../hooks/useIsPageLoading';
import { isInitializingHotkeyScopeState } from '../../states/isInitializingHotkeyScopeState';
import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: row;
  height: 100vh;
  position: relative;
  width: 100vw;
`;

const NAVBAR_WIDTH = '236px';

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  width: ${() =>
    useRecoilValue(isNavbarOpenedState)
      ? `calc(100% - ${NAVBAR_WIDTH})`
      : '100%'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(isNavbarOpenedState) ? '0' : '100%')};
  }
`;

type OwnProps = {
  children: JSX.Element;
};

export function DefaultLayout({ children }: OwnProps) {
  const onboardingStatus = useOnboardingStatus();

  const isPageLoading = useIsPageLoading();

  console.log('Default Layout', { isPageLoading });

  // if (isPageLoading) {
  //   return null;
  // }

  return (
    <StyledLayout>
      <>
        <CommandMenu />
        <NavbarAnimatedContainer>
          <AppNavbar />
        </NavbarAnimatedContainer>
        <MainContainer>
          {onboardingStatus &&
          onboardingStatus !== OnboardingStatus.Completed ? (
            <>
              <CompaniesMockMode />
              <AnimatePresence mode="wait">
                <LayoutGroup>
                  <AuthModal>{children}</AuthModal>
                </LayoutGroup>
              </AnimatePresence>
            </>
          ) : (
            <>{children}</>
          )}
        </MainContainer>
      </>
    </StyledLayout>
  );
}
