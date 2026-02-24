import { type ActionMenuContextType } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuContextProviderDefault } from '@/action-menu/contexts/ActionMenuContextProviderDefault';
import { ActionMenuContextProviderWorkflowObjects } from '@/action-menu/contexts/ActionMenuContextProviderWorkflowObjects';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';

export const ActionMenuContextProvider = ({
  children,
  isInRightDrawer,
  displayType,
  actionMenuType,
  objectMetadataItemOverride,
}: Omit<ActionMenuContextType, 'actions'> & {
  children: React.ReactNode;
  objectMetadataItemOverride?: ObjectMetadataItem;
}) => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const objectMetadataItem =
    objectMetadataItemOverride ??
    objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
    );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const isWorkflowObject =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Workflow;

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  if (isWorkflowObject) {
    return (
      <ActionMenuContextProviderWorkflowObjects
        isInRightDrawer={isInRightDrawer}
        displayType={displayType}
        actionMenuType={actionMenuType}
        objectMetadataItem={objectMetadataItem}
      >
        {children}
      </ActionMenuContextProviderWorkflowObjects>
    );
  }

  return (
    <ActionMenuContextProviderDefault
      isInRightDrawer={isInRightDrawer}
      displayType={displayType}
      actionMenuType={actionMenuType}
      objectMetadataItem={objectMetadataItem}
    >
      {children}
    </ActionMenuContextProviderDefault>
  );
};
