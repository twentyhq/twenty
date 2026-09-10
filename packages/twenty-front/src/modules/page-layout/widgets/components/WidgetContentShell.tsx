import { StyledWidgetContentContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { type ReactNode } from 'react';

type WidgetContentShellProps = {
  children?: ReactNode;
};

export const WidgetContentShell = ({ children }: WidgetContentShellProps) => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledWidgetContentContainer>{children}</StyledWidgetContentContainer>
    </SidePanelProvider>
  );
};
