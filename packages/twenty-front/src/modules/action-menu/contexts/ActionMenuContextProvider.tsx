import { type ActionMenuContextType } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuContextProviderDefault } from '@/action-menu/contexts/ActionMenuContextProviderDefault';
import { ActionMenuContextProviderWorkflowObjects } from '@/action-menu/contexts/ActionMenuContextProviderWorkflowObjects';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
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
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
