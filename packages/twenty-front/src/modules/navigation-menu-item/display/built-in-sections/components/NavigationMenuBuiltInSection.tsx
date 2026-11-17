import { NavigationMenuItemType } from 'twenty-shared/types';

import { NavigationDrawerInboxChannelsSection } from '@/inbox/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxTriageSection } from '@/inbox/components/NavigationDrawerInboxTriageSection';
import { NavigationMenuAiChatFavoritesSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatFavoritesSection';
import { NavigationMenuAiChatRecentsSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatRecentsSection';
import { FavoritesSectionDispatcher } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type NavigationMenuBuiltInSectionProps = {
  section: Pick<NavigationMenuItem, 'id' | 'type'>;
};

export const NavigationMenuBuiltInSection = ({
  section,
}: NavigationMenuBuiltInSectionProps) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (section.type === NavigationMenuItemType.FAVORITES) {
    return <FavoritesSectionDispatcher />;
  }

  if (!hasAiPermission || !isAiChatInboxEnabled) {
    return null;
  }

  switch (section.type) {
    case NavigationMenuItemType.AI_CHAT_INBOX:
      return <NavigationDrawerInboxTriageSection />;
    case NavigationMenuItemType.AI_CHAT_FAVORITES:
      return <NavigationMenuAiChatFavoritesSection />;
    case NavigationMenuItemType.AI_CHAT_CHANNELS:
      return <NavigationDrawerInboxChannelsSection />;
    case NavigationMenuItemType.AI_CHAT_RECENTS:
      return <NavigationMenuAiChatRecentsSection sectionId={section.id} />;
    default:
      return null;
  }
};
