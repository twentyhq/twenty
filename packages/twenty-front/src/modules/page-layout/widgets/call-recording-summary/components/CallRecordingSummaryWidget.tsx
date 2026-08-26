import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useCallRecordingWidgetUnavailableReason } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetUnavailableReason';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { isDefined } from 'twenty-shared/utils';

export const CallRecordingSummaryWidget = () => {
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
      <CallRecordingSummaryWidgetContent />
    </StyledWidgetScrollContainer>
  );
};
