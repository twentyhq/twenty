import { useLingui } from '@lingui/react/macro';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { useIsDropdownOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownOpen';

type NavigationDrawerAiChatThreadItemProps = {
  thread: AgentChatThread;
  isActive: boolean;
  onClick: (thread: AgentChatThread) => void;
};

export const NavigationDrawerAiChatThreadItem = ({
  thread,
  isActive,
  onClick,
}: NavigationDrawerAiChatThreadItemProps) => {
  const { t } = useLingui();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const isArchived = Boolean(thread.deletedAt);
  const displayLabel = thread.title || t`New chat`;
  const itemMenuDropdownId = getAiChatThreadItemMenuDropdownId(
    thread.id,
    AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER,
  );
  const isDropdownOpen = useIsDropdownOpen(itemMenuDropdownId);

  if (isRenaming) {
    return (
      <NavigationDrawerInput
        value={draftTitle}
        onChange={setDraftTitle}
        onSubmit={commitRename}
        onCancel={cancelRename}
        onClickOutside={(_event, value) => commitRename(value)}
        placeholder={t`Chat name`}
      />
    );
  }

  return (
    <NavigationDrawerItem
      label={displayLabel}
      active={isActive}
      onClick={() => onClick(thread)}
      variant={isArchived ? 'tertiary' : 'default'}
      isRightOptionsDropdownOpen={isDropdownOpen}
      rightOptions={
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayLabel}
          isArchived={isArchived}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
          onRenameRequested={startRename}
        />
      }
    />
  );
};
