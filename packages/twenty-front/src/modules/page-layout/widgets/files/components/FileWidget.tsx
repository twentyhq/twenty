import { FilesCard } from '@/activities/files/components/FilesCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FileWidgetProps = {
  widget: PageLayoutWidget;
};

export const FileWidget = ({ widget: _widget }: FileWidgetProps) => {
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <FilesCard />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
