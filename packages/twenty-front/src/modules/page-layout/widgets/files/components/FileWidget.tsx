import { FilesCard } from '@/activities/files/components/FilesCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FileWidgetProps = {
  widget: PageLayoutWidget;
};

export const FileWidget = ({ widget: _widget }: FileWidgetProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <FilesCard />
      </StyledContainer>
    </SidePanelProvider>
  );
};
