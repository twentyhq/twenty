import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerAiChatChannelActionsDropdown } from '@/ai/components/NavigationDrawerAiChatChannelActionsDropdown';
import { useAgentChatChannelActions } from '@/ai/hooks/useAgentChatChannelActions';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatChannelListItem } from '~/generated-metadata/graphql';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

type NavigationDrawerAiChatChannelItemProps = {
  channel: AgentChatChannelListItem;
  summary: AgentChatChannelSummary | undefined;
  destinationChannels: AgentChatChannelListItem[];
};

export const NavigationDrawerAiChatChannelItem = ({
  channel,
  summary,
  destinationChannels,
}: NavigationDrawerAiChatChannelItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const instanceId = useId();
  const dropdownId = `ai-chat-channel-actions-${instanceId}`;
  const deleteDialogId = `ai-chat-channel-delete-${instanceId}`;
  const ChannelIcon = useAgentChatChannelIcon(channel.icon);
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const {
    renameAgentChatChannel,
    setAgentChatChannelVisibility,
    leaveAgentChatChannel,
    deleteAgentChatChannel,
  } = useAgentChatChannelActions();
  const { openDialog } = useDialog();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [deleteDestinationChannelId, setDeleteDestinationChannelId] = useState<
    string | null
  >(null);

  const commitRename = (name: string) => {
    setDraftName(null);

    const trimmedName = name.trim();

    if (trimmedName.length > 0 && trimmedName !== channel.name) {
      void renameAgentChatChannel(channel.id, trimmedName);
    }
  };

  if (isDefined(draftName)) {
    return (
      <NavigationDrawerInput
        Icon={ChannelIcon}
        value={draftName}
        onChange={setDraftName}
        onSubmit={commitRename}
        onCancel={() => setDraftName(null)}
        onClickOutside={(_event, value) => commitRename(value)}
        placeholder={t`Channel name`}
      />
    );
  }

  const destinationChannelName = destinationChannels.find(
    ({ id }) => id === deleteDestinationChannelId,
  )?.name;
  const channelName = channel.name;
  const openCount = summary?.openCount ?? 0;

  return (
    <>
      <NavigationDrawerItem
        label={channel.name}
        Icon={ChannelIcon}
        secondaryLabel={openCount > 0 ? `${openCount}` : undefined}
        isUnread={summary?.hasUnreadOpen}
        active={
          isAiChatInboxPath(location.pathname) &&
          agentChatShownChannelView?.channelId === channel.id
        }
        onClick={() => openAgentChatChannel(channel.id)}
        triggerEvent="CLICK"
        isRightOptionsDropdownOpen={isDropdownOpen}
        rightOptions={
          <NavigationDrawerAiChatChannelActionsDropdown
            channel={channel}
            destinationChannels={destinationChannels}
            dropdownId={dropdownId}
            onRename={() => setDraftName(channel.name)}
            onSetVisibility={(visibility) =>
              void setAgentChatChannelVisibility(channel.id, visibility)
            }
            onLeave={() => void leaveAgentChatChannel(channel.id)}
            onDelete={(destinationChannelId) => {
              setDeleteDestinationChannelId(destinationChannelId);
              openDialog(deleteDialogId);
            }}
          />
        }
      />
      <ConfirmationDialog
        dialogId={deleteDialogId}
        title={t`Delete ${channelName}?`}
        subtitle={
          isDefined(destinationChannelName)
            ? t`Its chats move to ${destinationChannelName}. This cannot be undone.`
            : t`This cannot be undone.`
        }
        onConfirmClick={() =>
          void deleteAgentChatChannel(channel.id, deleteDestinationChannelId)
        }
        confirmButtonText={t`Delete channel`}
      />
    </>
  );
};
