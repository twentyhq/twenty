import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderLegacy } from '@/command-menu-item/contexts/CommandMenuContextProviderLegacy';
import { CommandMenuContextProviderServerItems } from '@/command-menu-item/server-items/common/contexts/CommandMenuContextProviderServerItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const CommandMenuContextProvider = ({
  children,
  isInSidePanel,
  displayType,
  containerType,
  objectMetadataItemOverride,
}: Omit<CommandMenuContextType, 'commandMenuItems'> & {
  children: React.ReactNode;
  objectMetadataItemOverride?: EnrichedObjectMetadataItem;
}) => {
  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
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

  return (
    <CommandMenuContextProviderLegacy
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      containerType={containerType}
      objectMetadataItemOverride={objectMetadataItemOverride}
    >
      {children}
    </CommandMenuContextProviderLegacy>
  );
};
