import { type ReactNode } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { NavigationDrawerInboxChannelsSection } from '@/inbox/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxTriageSection } from '@/inbox/components/NavigationDrawerInboxTriageSection';
import { NavigationMenuAiChatFavoritesSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatFavoritesSection';
import { NavigationMenuAiChatRecentsSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatRecentsSection';
import { FavoritesSectionDispatcher } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher';
import { useAreAiChatSectionsAvailable } from '@/navigation-menu-item/display/hooks/useAreAiChatSectionsAvailable';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuBuiltInSectionProps = {
  section: Pick<NavigationMenuItem, 'id' | 'type'>;
  headerAction?: ReactNode;
};

export const NavigationMenuBuiltInSection = ({
  section,
  headerAction,
}: NavigationMenuBuiltInSectionProps) => {
  const areAiChatSectionsAvailable = useAreAiChatSectionsAvailable();

  if (section.type === NavigationMenuItemType.FAVORITES) {
    return <FavoritesSectionDispatcher />;
  }

  if (!areAiChatSectionsAvailable) {
    return null;
  }

  switch (section.type) {
    case NavigationMenuItemType.AI_CHAT_INBOX:
      return <NavigationDrawerInboxTriageSection headerAction={headerAction} />;
    case NavigationMenuItemType.AI_CHAT_FAVORITES:
      return (
        <NavigationMenuAiChatFavoritesSection headerAction={headerAction} />
      );
    case NavigationMenuItemType.AI_CHAT_CHANNELS:
      return (
        <NavigationDrawerInboxChannelsSection headerAction={headerAction} />
      );
    case NavigationMenuItemType.AI_CHAT_RECENTS:
      return (
        <NavigationMenuAiChatRecentsSection
          sectionId={section.id}
          headerAction={headerAction}
        />
      );
    default:
      return null;
  }
};
