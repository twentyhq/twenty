import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { CommandMenuSidePanelForDesktop } from '@/command-menu/components/CommandMenuSidePanelForDesktop';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

type MainContainerLayoutWithCommandMenuProps = {
  children: ReactNode;
};

const StyledMainContainerLayoutForDesktop = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledPageBodyForDesktop = styled(PageBody)`
  flex: 1 1 0;
  min-width: 0;
  width: 0;
  padding-bottom: 0;
  padding-right: 0;
`;

const StyledMainContainerLayoutForMobile = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 0;
`;

const StyledPageBodyForMobile = styled(PageBody)`
  padding-bottom: 0;
  padding-left: ${({ theme }) => theme.spacing(1)};

  padding-right: ${({ theme }) => theme.spacing(1.5)};
`;

export const MainContainerLayoutWithCommandMenu = ({
  children,
}: MainContainerLayoutWithCommandMenuProps) => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  if (isMobile) {
    return (
      <StyledMainContainerLayoutForMobile>
        <StyledPageBodyForMobile>{children}</StyledPageBodyForMobile>
        <CommandMenuForMobile />
      </StyledMainContainerLayoutForMobile>
    );
  }

  return (
    <StyledMainContainerLayoutForDesktop>
      <StyledPageBodyForDesktop>{children}</StyledPageBodyForDesktop>
      <CommandMenuSidePanelForDesktop />
    </StyledMainContainerLayoutForDesktop>
  );
};
