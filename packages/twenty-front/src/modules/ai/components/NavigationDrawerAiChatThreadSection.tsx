import { type ReactNode } from 'react';

import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';

export type NavigationDrawerAiChatThreadSectionProps = {
  sectionId: string;
  title: string;
  threads: AgentChatThreadListItem[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThreadListItem) => void;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
  visibleItemLimit?: number | null;
  fetchMoreTrigger?: ReactNode;
};

export const NavigationDrawerAiChatThreadSection = ({
  sectionId,
  title,
  threads,
  currentThreadId,
  onThreadClick,
  rightIcon,
  alwaysShowRightIcon,
  visibleItemLimit,
  fetchMoreTrigger,
}: NavigationDrawerAiChatThreadSectionProps) => {
  const {
    visibleItems,
    isOverVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId: sectionId,
    items: threads,
    visibleItemLimit,
  });

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={sectionId}
      label={title}
      rightIcon={rightIcon}
      alwaysShowRightIcon={alwaysShowRightIcon}
    >
      {visibleItems.map((thread) => (
        <NavigationDrawerAiChatThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onClick={onThreadClick}
        />
      ))}
      {(!isOverVisibleItemLimit || isShowingAllItems) && fetchMoreTrigger}
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
