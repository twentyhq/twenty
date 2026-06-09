import { AuthModal } from '@/auth/components/AuthModal';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';
import { AppPageErrorFallback } from '@/error-handler/components/AppPageErrorFallback';
import { FileUploadProvider } from '@/file-upload/components/FileUploadProvider';
import { InformationBannerIsImpersonating } from '@/information-banner/components/impersonate/InformationBannerIsImpersonating';
import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';
import { LayoutCustomizationBar } from '@/layout-customization/components/LayoutCustomizationBar';
import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { PageDragDropProvider } from '@/navigation-menu-item/display/dnd/providers/PageDragDropProvider';
import { BackgroundMockNavigationDrawer } from '@/sign-in-background-mock/components/BackgroundMockNavigationDrawer';
import { Suspense, lazy } from 'react';

const BackgroundMockPage = lazy(() =>
  import('@/sign-in-background-mock/components/BackgroundMockPage').then(
    (module) => ({ default: module.BackgroundMockPage }),
  ),
);
import { useShowFullscreen } from '@/ui/layout/fullscreen/hooks/useShowFullscreen';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
const StyledLayout = styled.div`
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: 4px;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

const StyledPageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
  min-width: 0;
`;

const StyledNavigationDrawerWrapper = styled.div`
  flex-shrink: 0;
`;

const StyledMainContainer = styled.div`
  display: flex;
  flex: 0 1 100%;
  min-width: 0;
  overflow: hidden;
`;

export const DefaultLayout = () => {
  const isMobile = useIsMobile();
  const showAuthModal = useShowAuthModal();
  const useShowFullScreen = useShowFullscreen();

  return (
    <>
      <FileUploadProvider>
        <StyledLayout>
          <AppErrorBoundary FallbackComponent={AppFullScreenErrorFallback}>
            <InformationBannerIsImpersonating />
            <LayoutCustomizationBar />
            <StyledPageContainer>
              <PageDragDropProvider>
                {!showAuthModal && <KeyboardShortcutMenu />}
                {showAuthModal ? (
                  <StyledNavigationDrawerWrapper>
                    <BackgroundMockNavigationDrawer />
                  </StyledNavigationDrawerWrapper>
                ) : useShowFullScreen ? null : (
                  <StyledNavigationDrawerWrapper>
                    <AppNavigationDrawer />
                  </StyledNavigationDrawerWrapper>
                )}
                {showAuthModal ? (
                  <>
                    <StyledMainContainer>
                      <Suspense fallback={null}>
                        <BackgroundMockPage />
                      </Suspense>
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
              </PageDragDropProvider>
            </StyledPageContainer>
            {isMobile && !showAuthModal && <MobileNavigationBar />}
          </AppErrorBoundary>
        </StyledLayout>
      </FileUploadProvider>
    </>
  );
};
