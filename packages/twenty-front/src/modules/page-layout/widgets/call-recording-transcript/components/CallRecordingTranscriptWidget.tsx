import { useDoObjectMetadataItemsExist } from '@/object-metadata/hooks/useDoObjectMetadataItemsExist';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { useCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const StyledWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

type CallRecordingTranscriptWidgetProps = {
  widgetId: string;
};

type CallRecordingTranscriptWidgetContentProps = {
  widgetId: string;
};

const CallRecordingTranscriptWidgetContent = ({
  widgetId,
}: CallRecordingTranscriptWidgetContentProps) => {
  const { callRecordingTranscriptState } =
    useCalendarEventCallRecordingTranscript();

  return (
    <CallRecordingTranscriptBody
      widgetId={widgetId}
      callRecordingTranscriptState={callRecordingTranscriptState}
    />
  );
};

export const CallRecordingTranscriptWidget = ({
  widgetId,
}: CallRecordingTranscriptWidgetProps) => {
  // The transcript hooks throw on missing object metadata, so a workspace
  // without the callRecording object must be caught before they run.
  const doesCallRecordingObjectExist = useDoObjectMetadataItemsExist([
    CoreObjectNameSingular.CallRecording,
  ]);

  return (
    <StyledWidgetContainer>
      {doesCallRecordingObjectExist ? (
        <CallRecordingTranscriptWidgetContent widgetId={widgetId} />
      ) : (
        <CallRecordingTranscriptBody
          widgetId={widgetId}
          callRecordingTranscriptState={{ state: 'UNAVAILABLE' }}
        />
      )}
    </StyledWidgetContainer>
  );
};
