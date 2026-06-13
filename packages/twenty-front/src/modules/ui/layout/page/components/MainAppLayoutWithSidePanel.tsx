import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

const APP_TO_SETTINGS_TRANSITION_DURATION_IN_SECONDS = 0.3;

const SETTINGS_PATH_PREFIX = `/${AppPath.Settings}`;

const getMainAppLayoutRouteSection = (pathname: string) =>
  pathname === SETTINGS_PATH_PREFIX ||
  pathname.startsWith(`${SETTINGS_PATH_PREFIX}/`)
    ? 'settings'
    : 'app';

const StyledRow = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 0;
  min-width: 0;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledContentTransitionContainer = styled.div`
  display: grid;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledContentTransitionPage = styled(motion.div)`
  display: flex;
  grid-area: 1 / 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
`;

const MainAppLayoutOutlet = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const routeSection = getMainAppLayoutRouteSection(pathname);

  return (
    <StyledContentTransitionContainer>
      <AnimatePresence initial={false}>
        <StyledContentTransitionPage
          key={routeSection}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{
            duration: APP_TO_SETTINGS_TRANSITION_DURATION_IN_SECONDS,
            ease: 'easeInOut',
          }}
        >
          {outlet}
        </StyledContentTransitionPage>
      </AnimatePresence>
    </StyledContentTransitionContainer>
  );
};

export const MainAppLayoutWithSidePanel = () => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  return (
    <StyledRow>
      <StyledContent>
        <MainAppLayoutOutlet />
      </StyledContent>
      {isMobile ? <CommandMenuForMobile /> : <SidePanelForDesktop />}
    </StyledRow>
  );
};
