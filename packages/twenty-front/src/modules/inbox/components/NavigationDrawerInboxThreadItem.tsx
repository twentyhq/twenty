import { IconMessage } from 'twenty-ui/icon';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useIsAiChatThreadShownAsUnread } from '@/ai/hooks/useIsAiChatThreadShownAsUnread';
import { useAiChatThreadDisplayLabel } from '@/ai/hooks/useAiChatThreadDisplayLabel';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';

type NavigationDrawerInboxThreadItemProps = {
  thread: InboxThreadListItemData;
  isActive: boolean;
  onClick: (thread: InboxThreadListItemData) => void;
};

export const NavigationDrawerInboxThreadItem = ({
  thread,
  isActive,
  onClick,
}: NavigationDrawerInboxThreadItemProps) => {
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
  const isShownAsUnread = useIsAiChatThreadShownAsUnread(thread);
  const displayLabel = useAiChatThreadDisplayLabel({
    thread,
    fallbackLabel: t`New chat`,
  });
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
      isUnread={isShownAsUnread}
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
