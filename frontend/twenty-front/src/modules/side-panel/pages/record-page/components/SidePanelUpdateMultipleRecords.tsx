import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';

import { UpdateMultipleRecordsContainer } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { styled } from '@linaria/react';

const StyledSidePanelRecord = styled.div`
  height: 100%;
`;

export const SidePanelUpdateMultipleRecords = () => {
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  if (!sidePanelPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    sidePanelPageInstanceId,
  );

  return (
    <StyledSidePanelRecord>
      <UpdateMultipleRecordsContainer
        objectNameSingular={objectMetadataItem.nameSingular}
        contextStoreInstanceId={sidePanelPageInstanceId}
      />
    </StyledSidePanelRecord>
  );
};
