import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { AgentChatProvider } from '@/ai/components/AgentChatProvider';
import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';

type CommandMenuContainerProps = {
  children: React.ReactNode;
};

export const CommandMenuContainer = ({
  children,
}: CommandMenuContainerProps) => {
  const objectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataItemId,
  );

  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem?.namePlural ?? '',
    currentViewId ?? '',
  );

  return (
    <RecordComponentInstanceContextsWrapper componentInstanceId={recordIndexId}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
        >
          <AgentChatProvider>{children}</AgentChatProvider>
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
