import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
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

export const CallRecordingSummaryWidget = () => {
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
      <CallRecordingSummaryWidgetContent />
    </StyledWidgetContainer>
  );
};
