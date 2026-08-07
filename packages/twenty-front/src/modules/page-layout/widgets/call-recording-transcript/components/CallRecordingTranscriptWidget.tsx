import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { useCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript';
import { styled } from '@linaria/react';

const StyledWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

export const CallRecordingTranscriptWidget = () => {
  const { callRecordingTranscriptState } =
    useCalendarEventCallRecordingTranscript();

  return (
    <StyledWidgetContainer data-testid="call-recording-transcript-widget">
      <CallRecordingTranscriptBody
        callRecordingTranscriptState={callRecordingTranscriptState}
      />
    </StyledWidgetContainer>
  );
};
