import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';
import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { SignInAppNavigationDrawerMock } from '@/sign-in-background-mock/components/SignInAppNavigationDrawerMock';
import { SignInBackgroundMockPage } from '@/sign-in-background-mock/components/SignInBackgroundMockPage';
import { useShowFullscreen } from '@/ui/layout/fullscreen/hooks/useShowFullscreen';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { Global, css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { LayoutGroup, motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { useScreenSize } from 'twenty-ui';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100dvh;
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

const StyledPageContainer = styled(motion.div)`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
`;

const StyledAppNavigationDrawerMock = styled(SignInAppNavigationDrawerMock)`
  flex-shrink: 0;
`;

const StyledContent = styled(Modal.Content)`
  align-items: center;
  justify-content: center;
`;

export const VerifyLayout = () => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const theme = useTheme();
  const windowsWidth = useScreenSize().width;

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
          <StyledPageContainer
            animate={{
              marginLeft:
                isSettingsPage && !isMobile && !useShowFullScreen
                  ? (windowsWidth -
                      (OBJECT_SETTINGS_WIDTH +
                        NAV_DRAWER_WIDTHS.menu.desktop.expanded +
                        64)) /
                    2
                  : 0,
            }}
            transition={{ duration: theme.animation.duration.normal }}
          >
            <StyledAppNavigationDrawerMock />
            <SignInBackgroundMockPage />
            <LayoutGroup>
              <Modal padding={'none'} modalVariant="primary">
                <ScrollWrapper
                  contextProviderName="modalContent"
                  componentInstanceId="scroll-wrapper-modal-content"
                >
                  <StyledContent>
                    <Outlet></Outlet>
                  </StyledContent>
                </ScrollWrapper>
              </Modal>
            </LayoutGroup>
          </StyledPageContainer>
          {isMobile && <MobileNavigationBar />}
        </AppErrorBoundary>
      </StyledLayout>
    </>
  );
};
