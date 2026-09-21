import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useCallRecordingWidgetUnavailableReason } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetUnavailableReason';
import { type CallRecordingWidgetKind } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetKind';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
import { CallRecordingTranscriptWidgetContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { isDefined } from 'twenty-shared/utils';

type CallRecordingWidgetProps = {
  kind: CallRecordingWidgetKind;
};

export const CallRecordingWidget = ({ kind }: CallRecordingWidgetProps) => {
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
      {kind === 'summary' ? (
        <CallRecordingSummaryWidgetContent />
      ) : (
        <CallRecordingTranscriptWidgetContent />
      )}
    </StyledWidgetScrollContainer>
  );
};
