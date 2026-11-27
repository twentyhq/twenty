import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_FAVORITES_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxFavoritesNavigationSectionId';
import { NavigationDrawerInboxThreadItem } from '@/inbox/components/NavigationDrawerInboxThreadItem';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { StyledNavigationMenuSectionHiddenItems } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuSectionHiddenItems';
import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';

type NavigationDrawerInboxFavoritesSectionProps = {
  label?: string;
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
  visibleItemLimit?: number | null;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxFavoritesSection = ({
  label,
  threads,
  currentThreadId,
  onThreadClick,
  visibleItemLimit,
  headerAction,
}: NavigationDrawerInboxFavoritesSectionProps) => {
  const { t } = useLingui();
  const {
    visibleItems: visibleThreads,
    hiddenItems: hiddenThreads,
    hasHiddenItems,
  } = getNavigationSectionVisibleItems({
    items: threads,
    visibleItemLimit,
  });

  if (threads.length === 0 && !isDefined(headerAction)) {
    return null;
  }

  const renderThread = (thread: InboxThreadListItemData) => (
    <NavigationDrawerInboxThreadItem
      key={thread.id}
      thread={thread}
      isActive={currentThreadId === thread.id}
      onClick={onThreadClick}
    />
  );

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_FAVORITES_NAVIGATION_SECTION_ID}
      label={label ?? t`Favorites`}
      rightIcon={headerAction}
      alwaysShowRightIcon={isDefined(headerAction)}
    >
      {visibleThreads.map(renderThread)}
      {hasHiddenItems && (
        <NavigationMenuSectionSeeMore
          sectionId={INBOX_FAVORITES_NAVIGATION_SECTION_ID}
          hiddenItems={
            <StyledNavigationMenuSectionHiddenItems>
              {hiddenThreads.map(renderThread)}
            </StyledNavigationMenuSectionHiddenItems>
          }
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
