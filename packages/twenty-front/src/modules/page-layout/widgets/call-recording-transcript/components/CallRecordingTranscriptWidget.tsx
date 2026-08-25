import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useIsCallRecordingWidgetVisible } from '@/page-layout/widgets/call-recording/hooks/useIsCallRecordingWidgetVisible';
import { CallRecordingTranscriptWidgetContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';

export const CallRecordingTranscriptWidget = () => {
  const isWidgetVisible = useIsCallRecordingWidgetVisible();

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
