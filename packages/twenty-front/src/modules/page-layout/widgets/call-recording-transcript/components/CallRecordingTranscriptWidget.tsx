import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useCallRecordingWidgetUnavailableReason } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetUnavailableReason';
import { CallRecordingTranscriptWidgetContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { isDefined } from 'twenty-shared/utils';

export const CallRecordingTranscriptWidget = () => {
  const unavailableReason = useCallRecordingWidgetUnavailableReason();

  if (isDefined(unavailableReason)) {
    return (
      <StyledWidgetScrollContainer>
        <CallRecordingWidgetUnavailableDisplay reason={unavailableReason} />
      </StyledWidgetScrollContainer>
    );
  }

  return (
    <StyledWidgetScrollContainer>
      <CallRecordingTranscriptWidgetContent />
    </StyledWidgetScrollContainer>
  );
};
