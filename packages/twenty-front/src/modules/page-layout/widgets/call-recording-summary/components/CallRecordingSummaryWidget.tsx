import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useIsCalendarEventCallRecordingWidgetVisible } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useIsCalendarEventCallRecordingWidgetVisible';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
import { styled } from '@linaria/react';

const StyledWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

export const CallRecordingSummaryWidget = () => {
  const isWidgetVisible = useIsCalendarEventCallRecordingWidgetVisible();

  if (!isWidgetVisible) {
    return (
      <StyledWidgetContainer>
        <CallRecordingWidgetUnavailableDisplay />
      </StyledWidgetContainer>
    );
  }

  return (
    <StyledWidgetContainer>
      <CallRecordingSummaryWidgetContent />
    </StyledWidgetContainer>
  );
};
