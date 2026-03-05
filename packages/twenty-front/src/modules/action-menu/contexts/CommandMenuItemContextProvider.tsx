import { type CommandMenuItemContextType } from '@/action-menu/contexts/CommandMenuItemContext';
import { CommandMenuItemContextProviderDefault } from '@/action-menu/contexts/CommandMenuItemContextProviderDefault';
import { CommandMenuItemContextProviderWorkflowObjects } from '@/action-menu/contexts/CommandMenuItemContextProviderWorkflowObjects';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuItemContextProvider = ({
  children,
  isInSidePanel,
  displayType,
  actionMenuType,
  objectMetadataItemOverride,
}: Omit<CommandMenuItemContextType, 'actions'> & {
  children: React.ReactNode;
  objectMetadataItemOverride?: ObjectMetadataItem;
}) => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

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
      <CommandMenuItemContextProviderWorkflowObjects
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        actionMenuType={actionMenuType}
        objectMetadataItem={objectMetadataItem}
      >
        {children}
      </CommandMenuItemContextProviderWorkflowObjects>
    );
  }

  return (
    <CommandMenuItemContextProviderDefault
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      actionMenuType={actionMenuType}
      objectMetadataItem={objectMetadataItem}
    >
      {children}
    </CommandMenuItemContextProviderDefault>
  );
};
