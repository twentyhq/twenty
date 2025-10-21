import { NotesCard } from '@/activities/notes/components/NotesCard';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type NoteWidgetProps = {
  widget: PageLayoutWidget;
};

export const NoteWidget = ({ widget: _widget }: NoteWidgetProps) => {
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <NotesCard />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
