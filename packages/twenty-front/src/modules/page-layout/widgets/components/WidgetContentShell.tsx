import { StyledWidgetContentContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { type ReactNode } from 'react';

type WidgetContentShellProps = {
  children?: ReactNode;
};

export const WidgetContentShell = ({ children }: WidgetContentShellProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledWidgetContentContainer>{children}</StyledWidgetContentContainer>
    </SidePanelProvider>
  );
};
