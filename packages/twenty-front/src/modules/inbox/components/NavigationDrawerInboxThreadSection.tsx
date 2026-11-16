import { NavigationDrawerInboxThreadItem } from '@/inbox/components/NavigationDrawerInboxThreadItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';

export type NavigationDrawerInboxThreadSectionProps = {
  sectionId: string;
  title: string;
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
};

export const NavigationDrawerInboxThreadSection = ({
  sectionId,
  title,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerInboxThreadSectionProps) => {
  return (
    <CollapsibleNavigationDrawerSection sectionId={sectionId} label={title}>
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
