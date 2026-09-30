import { type ReactNode } from 'react';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type NavigationDrawerAiChatThreadSectionProps = {
  sectionId: string;
  title: string;
  threads: AgentChatThreadRecord[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThreadRecord) => void;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
};

export const NavigationDrawerAiChatThreadSection = ({
  sectionId,
  title,
  threads,
  currentThreadId,
  onThreadClick,
  rightIcon,
  alwaysShowRightIcon = false,
}: NavigationDrawerAiChatThreadSectionProps) => {
  return (
    <CollapsibleNavigationDrawerSection
      sectionId={sectionId}
      label={title}
      rightIcon={rightIcon}
      alwaysShowRightIcon={alwaysShowRightIcon}
    >
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
