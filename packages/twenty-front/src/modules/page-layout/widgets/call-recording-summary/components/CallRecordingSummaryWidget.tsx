import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';
import { CallRecordingSummaryWidgetContent } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidgetContent';
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

  const hasCallRecordingObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.CallRecording,
  );

  return (
    <StyledWidgetContainer>
      {hasCallRecordingObjectMetadata ? (
        <CallRecordingSummaryWidgetContent />
      ) : (
        <CallRecordingSummaryBody
          callRecordingSummaryState={{ state: 'UNAVAILABLE' }}
        />
      )}
    </StyledWidgetContainer>
  );
};
