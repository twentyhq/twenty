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
  section: Pick<NavigationMenuItem, 'id' | 'builtInSectionKey'>;
};

export const NavigationMenuBuiltInSection = ({
  section,
}: NavigationMenuBuiltInSectionProps) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (section.builtInSectionKey === 'favorites') {
    return <FavoritesSectionDispatcher />;
  }

  if (!hasAiPermission || !isAiChatInboxEnabled) {
    return null;
  }

  switch (section.builtInSectionKey) {
    case 'aiChatInbox':
      return <NavigationDrawerInboxTriageSection />;
    case 'aiChatFavorites':
      return <NavigationMenuAiChatFavoritesSection />;
    case 'aiChatChannels':
      return <NavigationDrawerInboxChannelsSection />;
    case 'aiChatRecents':
      return <NavigationMenuAiChatRecentsSection sectionId={section.id} />;
    default:
      return null;
  }
};
