import { type ReactNode } from 'react';

import { NavigationDrawerInboxChannelsSection } from '@/inbox/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxTriageSection } from '@/inbox/components/NavigationDrawerInboxTriageSection';
import { NavigationMenuAiChatFavoritesSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatFavoritesSection';
import { NavigationMenuAiChatRecentsSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatRecentsSection';
import { FavoritesSectionDispatcher } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher';
import { useAreAiChatSectionsAvailable } from '@/navigation-menu-item/display/hooks/useAreAiChatSectionsAvailable';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuBuiltInSectionProps = {
  section: Pick<NavigationMenuItem, 'id' | 'builtInSectionKey'>;
  headerAction?: ReactNode;
};

export const NavigationMenuBuiltInSection = ({
  section,
  headerAction,
}: NavigationMenuBuiltInSectionProps) => {
  const areAiChatSectionsAvailable = useAreAiChatSectionsAvailable();

  if (section.builtInSectionKey === 'favorites') {
    return <FavoritesSectionDispatcher />;
  }

  if (!areAiChatSectionsAvailable) {
    return null;
  }

  switch (section.builtInSectionKey) {
    case 'aiChatInbox':
      return <NavigationDrawerInboxTriageSection headerAction={headerAction} />;
    case 'aiChatFavorites':
      return (
        <NavigationMenuAiChatFavoritesSection headerAction={headerAction} />
      );
    case 'aiChatChannels':
      return (
        <NavigationDrawerInboxChannelsSection headerAction={headerAction} />
      );
    case 'aiChatRecents':
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
