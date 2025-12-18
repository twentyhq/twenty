import { AuthModal } from '@/auth/components/AuthModal';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';
import { AppPageErrorFallback } from '@/error-handler/components/AppPageErrorFallback';
import { InformationBannerIsImpersonating } from '@/information-banner/components/impersonate/InformationBannerIsImpersonating';
import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';
import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { SignInAppNavigationDrawerMock } from '@/sign-in-background-mock/components/SignInAppNavigationDrawerMock';
import { SignInBackgroundMockPage } from '@/sign-in-background-mock/components/SignInBackgroundMockPage';
import { useShowFullscreen } from '@/ui/layout/fullscreen/hooks/useShowFullscreen';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { Global, css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { useScreenSize } from 'twenty-ui/utilities';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  scrollbar-color: ${({ theme }) => theme.border.color.medium} transparent;
  scrollbar-width: 4px;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledPageContainer = styled(motion.div)`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
`;

const StyledAppNavigationDrawer = styled(AppNavigationDrawer)`
  flex-shrink: 0;
`;

const StyledAppNavigationDrawerMock = styled(SignInAppNavigationDrawerMock)`
  flex-shrink: 0;
`;

const StyledMainContainer = styled.div`
  display: flex;
  flex: 0 1 100%;
  overflow: hidden;
`;

export const DefaultLayout = () => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const theme = useTheme();
  const windowsWidth = useScreenSize().width;
  const showAuthModal = useShowAuthModal();
  const useShowFullScreen = useShowFullscreen();

  return (
    <>
      <Global
        styles={css`
          body {
            background: ${theme.background.tertiary};
          }
        `}
      />
      <StyledLayout>
        <AppErrorBoundary FallbackComponent={AppFullScreenErrorFallback}>
          <InformationBannerIsImpersonating />
          <StyledPageContainer
            animate={{
              marginLeft:
                isSettingsPage && !isMobile && !useShowFullScreen
                  ? (windowsWidth -
                      (OBJECT_SETTINGS_WIDTH +
                        NAVIGATION_DRAWER_CONSTRAINTS.default +
                        76)) /
                    2
                  : 0,
            }}
            transition={{
              duration: theme.animation.duration.normal,
            }}
          >
            {!showAuthModal && <KeyboardShortcutMenu />}
            {showAuthModal ? (
              <StyledAppNavigationDrawerMock />
            ) : useShowFullScreen ? null : (
              <StyledAppNavigationDrawer />
            )}
            {showAuthModal ? (
              <>
                <StyledMainContainer>
                  <SignInBackgroundMockPage />
                </StyledMainContainer>
                <AnimatePresence mode="wait">
                  <LayoutGroup>
                    <AuthModal>
                      <Outlet />
                    </AuthModal>
                  </LayoutGroup>
                </AnimatePresence>
              </>
            ) : (
              <StyledMainContainer>
                <AppErrorBoundary FallbackComponent={AppPageErrorFallback}>
                  <Outlet />
                </AppErrorBoundary>
              </StyledMainContainer>
            )}
          </StyledPageContainer>
          {isMobile && !showAuthModal && <MobileNavigationBar />}
        </AppErrorBoundary>
      </StyledLayout>
    </>
  );
};
