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

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;

    > :last-child {
      display: none;
    }
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
    overflow: visible;
  }
`;

const StyledContentTransitionContainer = styled.div`
  display: grid;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
    overflow: visible;
  }
`;

const StyledContentTransitionPage = styled(motion.div)`
  display: flex;
  grid-area: 1 / 1;
  min-height: 0;
  min-width: 0;
  width: 100%;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
  }
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
          // The outgoing page shares this grid cell with the incoming one, so it
          // must not capture pointer/scroll events — including when AnimatePresence
          // leaves a stale exit node mounted on top of the active page.
          exit={{ opacity: 0, y: -4, pointerEvents: 'none' }}
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
