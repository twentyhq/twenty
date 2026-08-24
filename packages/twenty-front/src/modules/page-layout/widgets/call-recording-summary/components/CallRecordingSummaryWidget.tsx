import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useIsCalendarEventCallRecordingWidgetVisible } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useIsCalendarEventCallRecordingWidgetVisible';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';

export const CallRecordingSummaryWidget = () => {
  const isWidgetVisible = useIsCalendarEventCallRecordingWidgetVisible();

  if (!isWidgetVisible) {
    return (
      <StyledWidgetScrollContainer>
        <CallRecordingWidgetUnavailableDisplay />
      </StyledWidgetScrollContainer>
    );
  }

  return (
    <StyledWidgetScrollContainer>
      <CallRecordingSummaryWidgetContent />
    </StyledWidgetScrollContainer>
  );
};
