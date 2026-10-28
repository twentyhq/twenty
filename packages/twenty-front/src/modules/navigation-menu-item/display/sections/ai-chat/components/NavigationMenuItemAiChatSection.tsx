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
import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { AI_CHAT_RECENTS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatRecentsNavigationSectionId';
import { useAiChatSidebarThreads } from '@/ai/hooks/useAiChatSidebarThreads';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemAiChatSectionLabel } from '@/navigation-menu-item/display/sections/ai-chat/hooks/useNavigationMenuItemAiChatSectionLabel';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
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
  const { getDefaultAiChatSectionLabel } =
    useNavigationMenuItemAiChatSectionLabel();
  const {
    isAiChatInboxEnabled,
    isLoading,
    favoriteChannels,
    favoriteThreads,
    recentThreads,
    currentAiChatThread,
    handleThreadClick,
  } = useAiChatSidebarThreads();

  if (!hasAiPermission) {
    return null;
  }

  const defaultLabel = getDefaultAiChatSectionLabel(section.type);
  const label = section.name ?? defaultLabel;
  const isEditable = isLayoutCustomizationModeEnabled && !isMobile;
  const sectionMenu = isEditable ? (
    <NavigationMenuItemSectionMenu
      section={section}
      defaultName={defaultLabel}
    />
  ) : undefined;
  const emptyEditableSection = isEditable ? (
    <CollapsibleNavigationDrawerSection
      sectionId={getNavigationMenuSectionNavigationSectionId(section)}
      label={label}
      rightIcon={sectionMenu}
      alwaysShowRightIcon={isEditable}
    >
      {null}
    </CollapsibleNavigationDrawerSection>
  ) : null;

  switch (section.type) {
    case NavigationMenuItemType.AI_CHAT_TRIAGE:
      return isAiChatInboxEnabled ? (
        <NavigationDrawerAiChatTriageSection
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
        return null;
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
