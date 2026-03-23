import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderDefault } from '@/command-menu-item/contexts/CommandMenuContextProviderDefault';
import { CommandMenuContextProviderWorkflowObjects } from '@/command-menu-item/contexts/CommandMenuContextProviderWorkflowObjects';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuContextProviderLegacy = ({
  children,
  isInSidePanel,
  displayType,
  containerType,
  objectMetadataItemOverride,
}: Omit<CommandMenuContextType, 'commandMenuItems'> & {
  children: React.ReactNode;
  objectMetadataItemOverride?: EnrichedObjectMetadataItem;
}) => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

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
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow;

  if (isWorkflowObject) {
    return (
      <CommandMenuContextProviderWorkflowObjects
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        containerType={containerType}
        objectMetadataItem={objectMetadataItem}
      >
        {children}
      </CommandMenuContextProviderWorkflowObjects>
    );
  }

  return (
    <CommandMenuContextProviderDefault
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      containerType={containerType}
      objectMetadataItem={objectMetadataItem}
    >
      {children}
    </CommandMenuContextProviderDefault>
  );
};
