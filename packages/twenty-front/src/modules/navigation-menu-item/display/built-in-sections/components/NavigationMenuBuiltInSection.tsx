import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerInboxChannelsSection } from '@/inbox/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxTriageSection } from '@/inbox/components/NavigationDrawerInboxTriageSection';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { NavigationMenuAiAgentsSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiAgentsSection';
import { NavigationMenuAiChatFavoritesSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatFavoritesSection';
import { NavigationMenuAiChatRecentsSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuAiChatRecentsSection';
import { FavoritesSectionDispatcher } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuBuiltInSectionProps = {
  section: Pick<
    NavigationMenuItem,
    'id' | 'builtInSectionKey' | 'visibleItemLimit'
  >;
  headerAction?: ReactNode;
};

export const NavigationMenuBuiltInSection = ({
  section,
  headerAction,
}: NavigationMenuBuiltInSectionProps) => {
  const { t } = useLingui();
  const inboxBuiltInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === 'aiChatInbox',
  );
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();

  if (section.builtInSectionKey === 'favorites') {
    return <FavoritesSectionDispatcher />;
  }

  if (!isBuiltInSectionAvailable(section.builtInSectionKey)) {
    return null;
  }

  if (section.builtInSectionKey === 'aiAgents') {
    return (
      <NavigationMenuAiAgentsSection
        visibleItemLimit={section.visibleItemLimit}
        headerAction={headerAction}
      />
    );
  }

  switch (section.builtInSectionKey) {
    case 'aiChatInbox':
      return (
        <NavigationDrawerInboxTriageSection
          label={
            isDefined(inboxBuiltInSection)
              ? t(inboxBuiltInSection.label)
              : undefined
          }
          visibleItemLimit={section.visibleItemLimit}
          headerAction={headerAction}
        />
      );
    case 'aiChatFavorites':
      return (
        <NavigationMenuAiChatFavoritesSection
          visibleItemLimit={section.visibleItemLimit}
          headerAction={headerAction}
        />
      );
    case 'aiChatChannels':
      return (
        <NavigationDrawerInboxChannelsSection
          visibleItemLimit={section.visibleItemLimit}
          headerAction={headerAction}
        />
      );
    case 'aiChatRecents':
      return (
        <NavigationMenuAiChatRecentsSection
          visibleItemLimit={section.visibleItemLimit}
          headerAction={headerAction}
        />
      );
    default:
      return null;
  }
};
