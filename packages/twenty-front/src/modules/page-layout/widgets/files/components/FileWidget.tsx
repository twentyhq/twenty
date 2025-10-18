import { FilesCard } from '@/activities/files/components/FilesCard';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

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
