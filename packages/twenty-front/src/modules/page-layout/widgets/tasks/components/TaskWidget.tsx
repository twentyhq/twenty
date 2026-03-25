import { TasksCard } from '@/activities/tasks/components/TasksCard';
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

type TaskWidgetProps = {
  widget: PageLayoutWidget;
};

export const TaskWidget = ({ widget: _widget }: TaskWidgetProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <TasksCard />
      </StyledContainer>
    </SidePanelProvider>
  );
};
