import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderDefault } from '@/command-menu-item/contexts/CommandMenuContextProviderDefault';
import { CommandMenuContextProviderServerItems } from '@/command-menu-item/contexts/CommandMenuContextProviderServerItems';
import { CommandMenuContextProviderWorkflowObjects } from '@/command-menu-item/contexts/CommandMenuContextProviderWorkflowObjects';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const CommandMenuContextProvider = ({
  children,
  isInSidePanel,
  displayType,
  containerType,
  objectMetadataItemOverride,
}: Omit<CommandMenuContextType, 'commandMenuItems'> & {
  children: React.ReactNode;
  objectMetadataItemOverride?: ObjectMetadataItem;
}) => {
  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

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

  if (isCommandMenuItemEnabled) {
    return (
      <CommandMenuContextProviderServerItems
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        containerType={containerType}
      >
        {children}
      </CommandMenuContextProviderServerItems>
    );
  }

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
