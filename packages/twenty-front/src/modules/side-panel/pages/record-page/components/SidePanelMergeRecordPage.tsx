import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { MergeRecordsContainer } from '@/object-record/record-merge/components/MergeRecordsContainer';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { styled } from '@linaria/react';

const StyledSidePanelRecord = styled.div`
  height: 100%;
`;

export const SidePanelMergeRecordPage = () => {
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    sidePanelPageInstanceId,
  );

  if (!sidePanelPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={`record-merge-${sidePanelPageInstanceId}`}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: sidePanelPageInstanceId,
        }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: sidePanelPageInstanceId }}
        >
          <StyledSidePanelRecord>
            <MergeRecordsContainer
              objectNameSingular={objectMetadataItem.nameSingular}
            />
          </StyledSidePanelRecord>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
