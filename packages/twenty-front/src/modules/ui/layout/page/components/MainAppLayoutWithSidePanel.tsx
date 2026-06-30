import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const ROUTE_SECTION_DATA_ATTRIBUTE = 'data-main-app-route-section';

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

    // Only the main content (first child) is printed; the side panel and its
    // resize chrome that follow it are hidden.
    > *:not(:first-child) {
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
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDefined(containerElement)) {
      return;
    }

    Array.from(containerElement.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        child.inert =
          child.getAttribute(ROUTE_SECTION_DATA_ATTRIBUTE) !== routeSection;
      }
    });
  }, [containerElement, routeSection]);

  return (
    <StyledContentTransitionContainer ref={setContainerElement}>
      <AnimatePresence initial={false}>
        <StyledContentTransitionPage
          key={routeSection}
          {...{ [ROUTE_SECTION_DATA_ATTRIBUTE]: routeSection }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
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
