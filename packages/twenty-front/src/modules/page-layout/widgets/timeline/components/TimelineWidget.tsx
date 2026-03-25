import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
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

type TimelineWidgetProps = {
  widget: PageLayoutWidget;
};

export const TimelineWidget = ({ widget: _widget }: TimelineWidgetProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <TimelineCard />
      </StyledContainer>
    </SidePanelProvider>
  );
};
