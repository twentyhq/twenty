import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerInboxChannelsSection } from '@/inbox/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxTriageSection } from '@/inbox/components/NavigationDrawerInboxTriageSection';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { getNavigationMenuBuiltInSectionLabel } from '@/navigation-menu-item/common/utils/getNavigationMenuBuiltInSectionLabel';
import { NavigationMenuAiChatFavoritesSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatFavoritesSection';
import { NavigationMenuAiChatRecentsSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatRecentsSection';
import { FavoritesSectionDispatcher } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher';
import { useAreAiChatSectionsAvailable } from '@/navigation-menu-item/display/hooks/useAreAiChatSectionsAvailable';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuBuiltInSectionProps = {
  section: Pick<NavigationMenuItem, 'id' | 'name' | 'builtInSectionKey'>;
  headerAction?: ReactNode;
};

export const NavigationMenuBuiltInSection = ({
  section,
  headerAction,
}: NavigationMenuBuiltInSectionProps) => {
  const { t } = useLingui();
  const areAiChatSectionsAvailable = useAreAiChatSectionsAvailable();
  const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === section.builtInSectionKey,
  );

  if (!isDefined(builtInSection)) {
    return null;
  }

  const label = getNavigationMenuBuiltInSectionLabel({
    name: section.name,
    defaultLabel: t(builtInSection.label),
  });

  if (section.builtInSectionKey === 'favorites') {
    return <FavoritesSectionDispatcher label={label} />;
  }

  if (!areAiChatSectionsAvailable) {
    return null;
  }

  switch (section.builtInSectionKey) {
    case 'aiChatInbox':
      return <NavigationDrawerInboxTriageSection headerAction={headerAction} />;
    case 'aiChatFavorites':
      return (
        <NavigationMenuAiChatFavoritesSection
          label={label}
          headerAction={headerAction}
        />
      );
    case 'aiChatChannels':
      return (
        <NavigationDrawerInboxChannelsSection
          label={label}
          headerAction={headerAction}
        />
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
