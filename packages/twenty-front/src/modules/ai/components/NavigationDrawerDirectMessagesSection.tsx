import { NavigationDrawerDirectMessageItem } from '@/ai/components/NavigationDrawerDirectMessageItem';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

type NavigationDrawerDirectMessagesSectionProps = {
  directMessages: readonly DirectMessageSidebarItem[];
  activeThreadId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (threadId: string) => void;
  memberPicker: ReactNode;
};

export const NavigationDrawerDirectMessagesSection = ({
  directMessages,
  activeThreadId,
  isOpen,
  onOpenChange,
  onSelect,
  memberPicker,
}: NavigationDrawerDirectMessagesSectionProps) => {
  const { t } = useLingui();

  return (
    <CollapsibleNavigationDrawerSection
      sectionId="DirectMessages"
      label={t`DMs`}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      rightIcon={memberPicker}
      alwaysShowRightIcon
    >
      {directMessages.map((directMessage) => (
        <NavigationDrawerDirectMessageItem
          key={directMessage.threadId}
          directMessage={directMessage}
          isActive={directMessage.threadId === activeThreadId}
          onSelect={onSelect}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
