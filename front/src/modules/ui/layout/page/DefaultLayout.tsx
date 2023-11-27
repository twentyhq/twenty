import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { AuthModal } from '@/auth/components/Modal';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';
import { SignInBackgroundMockPage } from '@/sign-in-background-mock/components/SignInBackgroundMockPage';
import { NavbarAnimatedContainer } from '@/ui/navigation/navbar/components/NavbarAnimatedContainer';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { AppNavbar } from '~/AppNavbar';

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
    height: 4px;
    width: 4px;
  }

  *::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledMainContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(isNavbarOpenedState) ? '0' : '100%')};
  }
`;

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const onboardingStatus = useOnboardingStatus();
  return (
    <StyledLayout>
      <CommandMenu />
      <KeyboardShortcutMenu />
      <NavbarAnimatedContainer>
        <AppNavbar />
      </NavbarAnimatedContainer>
      <StyledMainContainer>
        {onboardingStatus && onboardingStatus !== OnboardingStatus.Completed ? (
          <>
            <SignInBackgroundMockPage />
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
};
