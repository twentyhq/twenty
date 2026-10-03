import { IconMessage } from 'twenty-ui/icon';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useLingui } from '@lingui/react/macro';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { getAgentChatThreadDisplayTitle } from '@/ai/utils/getAgentChatThreadDisplayTitle';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';

type NavigationDrawerAiChatThreadItemProps = {
  thread: AgentChatThreadListItem;
  isActive: boolean;
  onClick: (thread: AgentChatThreadListItem) => void;
};

export const NavigationDrawerAiChatThreadItem = ({
  thread,
  isActive,
  onClick,
}: NavigationDrawerAiChatThreadItemProps) => {
  const { t } = useLingui();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const isDeleted = Boolean(thread.deletedAt);
  const { isUnread } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    thread.id,
  );
  const displayLabel = getAgentChatThreadDisplayTitle(thread.title);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getAiChatThreadItemMenuDropdownId({
      threadId: thread.id,
      surface: AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER,
    }),
  );
  if (isRenaming && isExpanded) {
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
      Icon={isExpanded ? undefined : IconMessage}
      label={displayLabel}
      active={isActive}
      onClick={() => onClick(thread)}
      variant={isDeleted ? 'tertiary' : 'default'}
      isUnread={!isDeleted && isUnread}
      isRightOptionsDropdownOpen={isDropdownOpen}
      rightOptions={
        <AiChatThreadActionsDropdown
          thread={thread}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
          onRenameRequested={startRename}
        />
      }
    />
  );
};
