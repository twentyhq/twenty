import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useIsCalendarEventCallRecordingWidgetVisible } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useIsCalendarEventCallRecordingWidgetVisible';
import { CallRecordingTranscriptWidgetContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';

export const CallRecordingTranscriptWidget = () => {
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
      <CallRecordingTranscriptWidgetContent />
    </StyledWidgetScrollContainer>
  );
};
