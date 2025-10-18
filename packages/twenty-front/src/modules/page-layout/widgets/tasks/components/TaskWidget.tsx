import { TasksCard } from '@/activities/tasks/components/TasksCard';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type TaskWidgetProps = {
  widget: PageLayoutWidget;
};

export const TaskWidget = ({ widget: _widget }: TaskWidgetProps) => {
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <TasksCard />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
