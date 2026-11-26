import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerInboxThreadItem } from '@/inbox/components/NavigationDrawerInboxThreadItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';

type NavigationDrawerInboxThreadSectionProps = {
  sectionId: string;
  title: string;
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
  footer?: ReactNode;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxThreadSection = ({
  sectionId,
  title,
  threads,
  currentThreadId,
  onThreadClick,
  footer,
  headerAction,
}: NavigationDrawerInboxThreadSectionProps) => {
  return (
    <CollapsibleNavigationDrawerSection
      sectionId={sectionId}
      label={title}
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
      {footer}
    </CollapsibleNavigationDrawerSection>
  );
};
