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
import { useShowFullscreen } from '@/ui/layout/fullscreen/hooks/useShowFullscreen';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';
const StyledLayout = styled.div`
  background: ${themeCssVariables.grayScale.gray3};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: 4px;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.md};
  }

  @media print {
    background: ${themeCssVariables.background.primary};
    height: auto;
    min-height: 100%;
    overflow: visible;
  }
`;

const StyledPageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
  min-width: 0;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
    overflow: visible;
  }
`;

const StyledNavigationDrawerWrapper = styled.div`
  flex-shrink: 0;

  @media print {
    display: none;
  }
`;

const StyledMainContainer = styled.div`
  display: flex;
  flex: 0 1 100%;
  min-width: 0;
  overflow: hidden;

  @media print {
    display: block;
    min-width: auto;
    overflow: visible;
  }
`;

export const DefaultLayout = () => {
  const isMobile = useIsMobile();
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
                <KeyboardShortcutMenu />
                {useShowFullScreen ? null : (
                  <StyledNavigationDrawerWrapper>
                    <AppNavigationDrawer />
                  </StyledNavigationDrawerWrapper>
                )}
                <StyledMainContainer>
                  <AppErrorBoundary FallbackComponent={AppPageErrorFallback}>
                    <Outlet />
                  </AppErrorBoundary>
                </StyledMainContainer>
              </PageDragDropProvider>
            </StyledPageContainer>
            {isMobile && <MobileNavigationBar />}
          </AppErrorBoundary>
        </StyledLayout>
      </FileUploadProvider>
    </>
  );
};
