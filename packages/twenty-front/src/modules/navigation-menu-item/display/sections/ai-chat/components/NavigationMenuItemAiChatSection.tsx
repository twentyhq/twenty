import { NavigationMenuItemType } from 'twenty-shared/types';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatFavoritesNavigationSectionId';
import { AI_CHAT_RECENTS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatRecentsNavigationSectionId';
import { useAiChatSidebarThreads } from '@/ai/hooks/useAiChatSidebarThreads';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemAiChatSectionLabel } from '@/navigation-menu-item/display/sections/ai-chat/hooks/useNavigationMenuItemAiChatSectionLabel';
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

  switch (section.type) {
    case NavigationMenuItemType.AI_CHAT_TRIAGE:
      if (isAiChatInboxEnabled) {
        return (
          <NavigationDrawerAiChatTriageSection
            label={label}
            rightIcon={sectionMenu}
            alwaysShowRightIcon={isEditable}
          />
        );
      }

      return isEditable ? (
        <CollapsibleNavigationDrawerSection
          sectionId={`navigation-menu-section-${section.id}`}
          label={label}
          rightIcon={sectionMenu}
          alwaysShowRightIcon={isEditable}
        >
          {null}
        </CollapsibleNavigationDrawerSection>
      ) : null;
    case NavigationMenuItemType.AI_CHAT_FAVORITES:
      if (favoriteThreads.length === 0 && !isEditable) {
        return null;
      }

      return (
        <NavigationDrawerAiChatThreadSection
          sectionId={AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID}
          title={label}
          threads={favoriteThreads}
          currentThreadId={currentAiChatThread}
          onThreadClick={handleThreadClick}
          rightIcon={sectionMenu}
          alwaysShowRightIcon={isEditable}
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
        <>
          <NavigationDrawerAiChatThreadSection
            sectionId={AI_CHAT_RECENTS_NAVIGATION_SECTION_ID}
            title={label}
            threads={recentThreads}
            currentThreadId={currentAiChatThread}
            onThreadClick={handleThreadClick}
            rightIcon={sectionMenu}
            alwaysShowRightIcon={isEditable}
          />
          {!isAiChatInboxEnabled && <AgentChatThreadsFetchMoreTrigger />}
        </>
      );
  }
};
