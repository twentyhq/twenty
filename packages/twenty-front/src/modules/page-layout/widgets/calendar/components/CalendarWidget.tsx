import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type CalendarWidgetProps = {
  widget: PageLayoutWidget;
};

export const CalendarWidget = ({ widget: _widget }: CalendarWidgetProps) => {
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <CalendarEventsCard />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
