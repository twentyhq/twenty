import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type MainContainerLayoutWithSidePanelProps = {
  children: ReactNode;
};

const StyledMainContainerLayoutForDesktop = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[3]};
`;

const StyledPageBodyForDesktopContainer = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  width: 0;

  > * {
    padding-bottom: 0;
    padding-right: 0;
  }
`;

const StyledMainContainerLayoutForMobile = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 0;
`;

const StyledPageBodyForMobileContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  > * {
    padding-bottom: 0;
    padding-left: ${themeCssVariables.spacing[1]};
    padding-right: ${themeCssVariables.spacing['1.5']};
  }
`;

export const MainContainerLayoutWithSidePanel = ({
  children,
}: MainContainerLayoutWithSidePanelProps) => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  if (isMobile) {
    return (
      <StyledMainContainerLayoutForMobile>
        <StyledPageBodyForMobileContainer>
          <PageBody>{children}</PageBody>
        </StyledPageBodyForMobileContainer>
        <CommandMenuForMobile />
      </StyledMainContainerLayoutForMobile>
    );
  }

  return (
    <StyledMainContainerLayoutForDesktop>
      <StyledPageBodyForDesktopContainer>
        <PageBody>{children}</PageBody>
      </StyledPageBodyForDesktopContainer>
      <SidePanelForDesktop />
    </StyledMainContainerLayoutForDesktop>
  );
};
