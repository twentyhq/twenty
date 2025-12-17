import { CommandMenuSidePanel } from '@/command-menu/components/CommandMenuSidePanel';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

type CommandMenuPageLayoutProps = {
  children: ReactNode;
};

const StyledLayout = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledPageBody = styled(PageBody)`
  flex: 1;
  min-width: 0;
  padding-bottom: 0;
  padding-right: 0;
`;

export const CommandMenuPageLayout = ({
  children,
}: CommandMenuPageLayoutProps) => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <StyledLayout>
      <StyledPageBody>{children}</StyledPageBody>
      <CommandMenuSidePanel />
    </StyledLayout>
  );
};
