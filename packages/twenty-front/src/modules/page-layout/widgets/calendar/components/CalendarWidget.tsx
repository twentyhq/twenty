import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
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

type CalendarWidgetProps = {
  widget: PageLayoutWidget;
};

export const CalendarWidget = ({ widget: _widget }: CalendarWidgetProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <CalendarEventsCard />
      </StyledContainer>
    </SidePanelProvider>
  );
};
