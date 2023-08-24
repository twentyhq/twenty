import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { AuthModal } from '@/auth/components/Modal';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { NavbarAnimatedContainer } from '@/ui/navbar/components/NavbarAnimatedContainer';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { AppNavbar } from '~/AppNavbar';
import { CompaniesMockMode } from '~/pages/companies/CompaniesMockMode';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: row;
  height: 100vh;
  position: relative;
  scrollbar-color: ${({ theme }) => theme.border.color.medium};

  scrollbar-width: 4px;
  width: 100vw;

  *::-webkit-scrollbar {
    height: 0px;
    width: 0px;
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.color.medium};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const NAVBAR_WIDTH = '236px';

const StyledMainContainer = styled.div`
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
  children: React.ReactNode;
};

export function DefaultLayout({ children }: OwnProps) {
  const onboardingStatus = useOnboardingStatus();

  return (
    <StyledLayout>
      <CommandMenu />
      <NavbarAnimatedContainer>
        <AppNavbar />
      </NavbarAnimatedContainer>
      <StyledMainContainer>
        {onboardingStatus && onboardingStatus !== OnboardingStatus.Completed ? (
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
      </StyledMainContainer>
    </StyledLayout>
  );
}
