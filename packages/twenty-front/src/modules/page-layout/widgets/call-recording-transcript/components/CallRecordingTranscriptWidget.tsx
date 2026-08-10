import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CallRecordingTranscriptWidgetContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidgetContent';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
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
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const hasCallRecordingObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.CallRecording,
  );

  const isCalendarEventTarget =
    targetRecordIdentifier?.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent;

  if (!hasCallRecordingObjectMetadata || !isCalendarEventTarget) {
    return null;
  }

  return (
    <StyledWidgetContainer>
      <CallRecordingTranscriptWidgetContent />
    </StyledWidgetContainer>
  );
};
