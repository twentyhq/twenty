import { IconMessage } from 'twenty-ui/icon';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
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
  const displayLabel = thread.title || t`New chat`;
  const actionsInstanceId = useId();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getCommandMenuDropdownIdFromCommandMenuId(actionsInstanceId),
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
          instanceId={actionsInstanceId}
          onRenameRequested={startRename}
        />
      }
    />
  );
};
