import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';

export type NavigationDrawerAiChatThreadSectionProps = {
  sectionId: string;
  title: string;
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
};

export const NavigationDrawerAiChatThreadSection = ({
  sectionId,
  title,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerAiChatThreadSectionProps) => {
  return (
    <CollapsibleNavigationDrawerSection sectionId={sectionId} label={title}>
      {threads.map((thread) => (
        <NavigationDrawerAiChatThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onClick={onThreadClick}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
