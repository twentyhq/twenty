import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerInboxThreadItem } from '@/inbox/components/NavigationDrawerInboxThreadItem';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';

const INBOX_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

type NavigationDrawerInboxFavoritesSectionProps = {
  label?: string;
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxFavoritesSection = ({
  label,
  threads,
  currentThreadId,
  onThreadClick,
  headerAction,
}: NavigationDrawerInboxFavoritesSectionProps) => {
  const { t } = useLingui();

  if (threads.length === 0 && !isDefined(headerAction)) {
    return null;
  }

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_FAVORITES_NAVIGATION_SECTION_ID}
      label={label ?? t`Favorites`}
      rightIcon={headerAction}
      alwaysShowRightIcon={isDefined(headerAction)}
    >
      {threads.map((thread) => (
        <NavigationDrawerInboxThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onClick={onThreadClick}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
