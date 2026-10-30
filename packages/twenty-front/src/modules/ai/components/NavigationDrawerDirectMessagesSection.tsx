import { NavigationDrawerDirectMessageItem } from '@/ai/components/NavigationDrawerDirectMessageItem';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

const AI_CHAT_DIRECT_MESSAGES_NAVIGATION_SECTION_ID = 'AiChatDirectMessages';

type NavigationDrawerDirectMessagesSectionProps = {
  directMessages: readonly DirectMessageSidebarItem[];
  currentThreadId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (threadId: string) => void;
  memberPicker: ReactNode;
};

export const NavigationDrawerDirectMessagesSection = ({
  directMessages,
  currentThreadId,
  isOpen,
  onOpenChange,
  onSelect,
  memberPicker,
}: NavigationDrawerDirectMessagesSectionProps) => {
  const { t } = useLingui();

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_DIRECT_MESSAGES_NAVIGATION_SECTION_ID}
      label={t({
        message: 'DMs',
        comment: 'Abbreviation of direct messages, sidebar section title',
      })}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      rightIcon={memberPicker}
      alwaysShowRightIcon
    >
      {directMessages.map((directMessage) => (
        <NavigationDrawerDirectMessageItem
          key={directMessage.threadId}
          directMessage={directMessage}
          isActive={directMessage.threadId === currentThreadId}
          onSelect={onSelect}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
