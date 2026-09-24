import { WorkspaceSetupChatSidePanelEffect } from '@/onboarding/effect-components/WorkspaceSetupChatSidePanelEffect';
import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { RouteContextStoreProvider } from '@/context-store/components/RouteContextStoreProvider';
import { LogConsole } from '@/log-console/components/LogConsole';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { SidePanelPathUrlSyncEffect } from '@/side-panel/routing/components/SidePanelPathUrlSyncEffect';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';

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

const StyledMainColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
    overflow: visible;
  }
`;

export const MainAppLayoutWithSidePanel = () => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  return (
    <StyledRow>
      <RouteContextStoreProvider />
      <SidePanelPathUrlSyncEffect />
      <WorkspaceSetupChatSidePanelEffect />
      <StyledMainColumn>
        <StyledContent>
          <Outlet />
        </StyledContent>
        <LogConsole />
      </StyledMainColumn>
      {isMobile ? <CommandMenuForMobile /> : <SidePanelForDesktop />}
    </StyledRow>
  );
};
