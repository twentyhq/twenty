import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

import { AuthModal } from '@/auth/components/Modal';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';
import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { SignInBackgroundMockPage } from '@/sign-in-background-mock/components/SignInBackgroundMockPage';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  scrollbar-color: ${({ theme }) => theme.border.color.medium};
  scrollbar-width: 4px;
  width: 100%;

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

const StyledPageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
`;

const StyledAppNavigationDrawer = styled(AppNavigationDrawer)`
  flex-shrink: 0;
`;

const StyledMainContainer = styled.div`
  display: flex;
  flex: 0 1 100%;
  overflow: hidden;
`;

type DefaultLayoutProps = {
  children: ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const onboardingStatus = useOnboardingStatus();
  const isMobile = useIsMobile();

  return (
    <StyledLayout>
      <CommandMenu />
      <KeyboardShortcutMenu />
      <StyledPageContainer>
        <StyledAppNavigationDrawer />
        <StyledMainContainer>
          {onboardingStatus &&
          onboardingStatus !== OnboardingStatus.Completed ? (
            <>
              <SignInBackgroundMockPage />
              <AnimatePresence mode="wait">
                <LayoutGroup>
                  <AuthModal>{children}</AuthModal>
                </LayoutGroup>
              </AnimatePresence>
            </>
          ) : (
            <AppErrorBoundary>{children}</AppErrorBoundary>
          )}
        </StyledMainContainer>
      </StyledPageContainer>
      {isMobile && <MobileNavigationBar />}
    </StyledLayout>
  );
};
