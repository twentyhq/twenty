import { NavigationMenuItemType } from 'twenty-shared/types';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatChannelsSection } from '@/ai/components/NavigationDrawerAiChatChannelsSection';
import { NavigationDrawerAiChatFavoritesSection } from '@/ai/components/NavigationDrawerAiChatFavoritesSection';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { NavigationDrawerAiChatInboxSection } from '@/ai/components/NavigationDrawerAiChatInboxSection';
import { AI_CHAT_RECENTS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatRecentsNavigationSectionId';
import { useAiChatSidebarThreads } from '@/ai/hooks/useAiChatSidebarThreads';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemSectionLabel } from '@/navigation-menu-item/common/hooks/useNavigationMenuItemSectionLabel';
import { isNavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSectionType';
import { NavigationMenuItemEditableSectionPlaceholder } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemEditableSectionPlaceholder';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemAiChatSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemAiChatSection = ({
  section,
}: NavigationMenuItemAiChatSectionProps) => {
  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { getDefaultSectionLabel } = useNavigationMenuItemSectionLabel();
  const {
    isAiChatInboxEnabled,
    isLoading,
    favoriteChannels,
    favoriteThreads,
    recentThreads,
    currentAiChatThread,
    handleThreadClick,
  } = useAiChatSidebarThreads();

  if (
    !hasAiPermission ||
    !isNavigationMenuItemBuiltInSectionType(section.type)
  ) {
    return null;
  }

  const defaultLabel = getDefaultSectionLabel(section.type);
  const label = section.name ?? defaultLabel;
  const isEditable = isLayoutCustomizationModeEnabled && !isMobile;
  const sectionMenu = isEditable ? (
    <NavigationMenuItemSectionMenu
      section={section}
      defaultName={defaultLabel}
    />
  ) : undefined;
  const emptyEditableSection = isEditable ? (
    <NavigationMenuItemEditableSectionPlaceholder
      section={section}
      defaultName={defaultLabel}
    />
  ) : null;

  switch (section.type) {
    case NavigationMenuItemType.AI_CHAT_INBOX:
      return isAiChatInboxEnabled ? (
        <NavigationDrawerAiChatInboxSection
          label={label}
          rightIcon={sectionMenu}
          alwaysShowRightIcon={isEditable}
          visibleItemLimit={section.visibleItemLimit}
        />
      ) : (
        emptyEditableSection
      );
    case NavigationMenuItemType.AI_CHAT_CHANNELS:
      return isAiChatInboxEnabled ? (
        <NavigationDrawerAiChatChannelsSection
          label={label}
          rightIcon={sectionMenu}
          alwaysShowRightIcon={isEditable ? true : undefined}
          visibleItemLimit={section.visibleItemLimit}
        />
      ) : (
        emptyEditableSection
      );
    case NavigationMenuItemType.AI_CHAT_FAVORITES:
      return (
        <NavigationDrawerAiChatFavoritesSection
          label={label}
          channels={favoriteChannels}
          threads={favoriteThreads}
          currentThreadId={currentAiChatThread}
          onThreadClick={handleThreadClick}
          rightIcon={sectionMenu}
          alwaysShowRightIcon={isEditable}
          isShownWhenEmpty={isEditable}
          visibleItemLimit={section.visibleItemLimit}
        />
      );
    default:
      if (isLoading) {
        return isExpanded ? <AiChatSkeletonLoader /> : null;
      }

      if (recentThreads.length === 0 && !isEditable) {
        return <AgentChatThreadsFetchMoreTrigger />;
      }

      return (
        <NavigationDrawerAiChatThreadSection
          sectionId={AI_CHAT_RECENTS_NAVIGATION_SECTION_ID}
          title={label}
          threads={recentThreads}
          currentThreadId={currentAiChatThread}
          onThreadClick={handleThreadClick}
          rightIcon={sectionMenu}
          alwaysShowRightIcon={isEditable}
          visibleItemLimit={section.visibleItemLimit}
          fetchMoreTrigger={<AgentChatThreadsFetchMoreTrigger />}
        />
      );
  }
};
