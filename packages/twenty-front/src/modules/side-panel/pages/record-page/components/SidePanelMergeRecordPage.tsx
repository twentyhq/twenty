import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
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
  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    commandMenuPageInstanceId,
  );

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={`record-merge-${commandMenuPageInstanceId}`}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: commandMenuPageInstanceId,
        }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: commandMenuPageInstanceId }}
        >
          <StyledSidePanelRecord>
            <MergeRecordsContainer
              objectNameSingular={objectMetadataItem.nameSingular}
            />
          </StyledSidePanelRecord>
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
