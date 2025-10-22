import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type TimelineWidgetProps = {
  widget: PageLayoutWidget;
};

export const TimelineWidget = ({ widget: _widget }: TimelineWidgetProps) => {
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <TimelineCard />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
