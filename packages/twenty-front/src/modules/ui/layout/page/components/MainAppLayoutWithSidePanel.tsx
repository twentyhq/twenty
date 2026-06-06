import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';

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

export const MainAppLayoutWithSidePanel = () => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  return (
    <StyledRow>
      <StyledContent>
        <Outlet />
      </StyledContent>
      {isMobile ? <CommandMenuForMobile /> : <SidePanelForDesktop />}
    </StyledRow>
  );
};
