import { type CommandMenuItemContextType } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { CommandMenuItemContextProviderDefault } from '@/command-menu-item/contexts/CommandMenuItemContextProviderDefault';
import { CommandMenuItemContextProviderWorkflowObjects } from '@/command-menu-item/contexts/CommandMenuItemContextProviderWorkflowObjects';
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
  containerType,
  objectMetadataItemOverride,
}: Omit<CommandMenuItemContextType, 'commandMenuItems'> & {
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
        containerType={containerType}
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
      containerType={containerType}
      objectMetadataItem={objectMetadataItem}
    >
      {children}
    </CommandMenuItemContextProviderDefault>
  );
};
