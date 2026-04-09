import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { TagSelectedRecordsContainer } from '@/object-record/record-tag-selected/components/TagSelectedRecordsContainer';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { styled } from '@linaria/react';

const StyledSidePanelRecord = styled.div`
  height: 100%;
`;

export const SidePanelTagSelectedRecords = () => {
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  if (!sidePanelPageInstanceId) {
    throw new Error('Side panel page instance id is not defined');
  }

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    sidePanelPageInstanceId,
  );

  return (
    <StyledSidePanelRecord>
      <TagSelectedRecordsContainer
        objectMetadataItem={objectMetadataItem}
        contextStoreInstanceId={sidePanelPageInstanceId}
      />
    </StyledSidePanelRecord>
  );
};
