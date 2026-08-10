import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptWidgetContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidgetContent';
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

export const CallRecordingTranscriptWidget = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  // Guard component: useCalendarEventCallRecordingTranscript queries callRecording
  // and would throw in a workspace where the object does not exist
  const hasCallRecordingObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.CallRecording,
  );

  return (
    <StyledWidgetContainer>
      {hasCallRecordingObjectMetadata ? (
        <CallRecordingTranscriptWidgetContent />
      ) : (
        <CallRecordingTranscriptBody
          callRecordingTranscriptState={{ state: 'UNAVAILABLE' }}
        />
      )}
    </StyledWidgetContainer>
  );
};
