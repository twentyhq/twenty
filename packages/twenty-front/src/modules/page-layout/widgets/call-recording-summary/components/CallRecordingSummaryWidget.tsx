import { CallRecordingWidgetUnavailableDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetUnavailableDisplay';
import { useIsCallRecordingWidgetVisible } from '@/page-layout/widgets/call-recording/hooks/useIsCallRecordingWidgetVisible';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';

export const CallRecordingSummaryWidget = () => {
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
      <CallRecordingSummaryWidgetContent />
    </StyledWidgetScrollContainer>
  );
};
