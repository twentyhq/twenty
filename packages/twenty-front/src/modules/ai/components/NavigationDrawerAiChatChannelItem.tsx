import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type MouseEvent, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { parseThemeColor } from 'twenty-ui/utilities';

import { InboxChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { NavigationDrawerInboxChannelActionsDropdown } from '@/ai/components/NavigationDrawerAiChatChannelActionsDropdown';
import { NavigationDrawerInboxChannelNavigation } from '@/ai/components/NavigationDrawerAiChatChannelNavigation';
import { useInboxChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { useDeleteInboxChannel } from '@/ai/hooks/useDeleteAgentChatChannel';
import { useIsInboxShowingDirectMessage } from '@/ai/hooks/useIsAiChatInboxShowingDirectMessage';
import { useUpdateInboxChannel } from '@/ai/hooks/useUpdateAgentChatChannel';
import { inboxSelectedChannelViewSelector } from '@/ai/states/selectors/agentChatSelectedChannelViewSelector';
import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { isInboxPath } from '~/utils/isAiChatInboxPath';

const StyledIconPickerTrigger = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
`;

// The picker opens from the icon, so its clicks must not open the channel
const stopPropagation = (event: MouseEvent) => event.stopPropagation();

type NavigationDrawerInboxChannelItemProps = {
  channel: AgentChatChannel;
  summary: AgentChatChannelSummary | undefined;
  destinationChannels: AgentChatChannel[];
  canManage: boolean;
  isExpandable?: boolean;
};

export const NavigationDrawerInboxChannelItem = ({
  channel,
  summary,
  destinationChannels,
  canManage,
  isExpandable = true,
}: NavigationDrawerInboxChannelItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const instanceId = useId();
  const dropdownId = `ai-chat-channel-actions-${instanceId}`;
  const iconPickerDropdownId = `ai-chat-channel-icon-${instanceId}`;
  const deleteDialogId = `ai-chat-channel-delete-${instanceId}`;
  const ChannelIcon = useInboxChannelIcon(channel.icon);
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const isInboxShowingDirectMessage = useIsInboxShowingDirectMessage();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { updateAgentChatChannel } = useUpdateInboxChannel();
  const { deleteAgentChatChannel } = useDeleteInboxChannel();
  const { openDropdown } = useOpenDropdown();
  const { openDialog } = useDialog();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [deleteDestinationChannelId, setDeleteDestinationChannelId] = useState<
    string | null
  >(null);

  const commitRename = (name: string) => {
    setDraftName(null);

    const trimmedName = name.trim();

    if (isNonEmptyString(trimmedName) && trimmedName !== channel.name) {
      void updateAgentChatChannel({
        channelId: channel.id,
        input: { name: trimmedName },
      });
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
  const coloredIcon = <InboxChannelIcon channel={channel} />;

  const icon = canManage ? (
    <StyledIconPickerTrigger
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <IconPicker
        dropdownId={iconPickerDropdownId}
        selectedIconKey={channel.icon ?? undefined}
        onChange={({ iconKey }) =>
          void updateAgentChatChannel({
            channelId: channel.id,
            input: { icon: iconKey },
          })
        }
        iconColorPicker={{
          selectedColor: parseThemeColor(channel.color),
          onColorChange: (color) =>
            void updateAgentChatChannel({
              channelId: channel.id,
              input: { color },
            }),
        }}
        clickableComponent={
          <StyledIconPickerTrigger aria-label={t`Choose icon and color`}>
            {coloredIcon}
          </StyledIconPickerTrigger>
        }
      />
    </StyledIconPickerTrigger>
  ) : (
    coloredIcon
  );

  return (
    <>
      <NavigationDrawerInboxChannelNavigation
        channel={channel}
        summary={summary}
        icon={icon}
        channelView={inboxSelectedChannelView}
        isActive={
          isInboxPath(location.pathname) &&
          !isInboxShowingDirectMessage &&
          inboxSelectedChannelView?.channelId === channel.id
        }
        isExpandable={isExpandable}
        isRightOptionsDropdownOpen={isDropdownOpen}
        rightOptions={
          canManage || channel.isAccessible ? (
            <NavigationDrawerInboxChannelActionsDropdown
              channel={channel}
              destinationChannels={destinationChannels}
              dropdownId={dropdownId}
              canManage={canManage}
              onRename={() => setDraftName(channel.name)}
              onChangeAppearance={() =>
                openDropdown({
                  dropdownComponentInstanceIdFromProps: iconPickerDropdownId,
                })
              }
              onUpdate={(input) =>
                void updateAgentChatChannel({ channelId: channel.id, input })
              }
              onDelete={(destinationChannelId) => {
                setDeleteDestinationChannelId(destinationChannelId);
                openDialog(deleteDialogId);
              }}
            />
          ) : undefined
        }
      />
      <ConfirmationDialog
        dialogId={deleteDialogId}
        title={t`Delete ${channelName}?`}
        subtitle={
          isDefined(destinationChannelName)
            ? t`Its chats move to ${destinationChannelName}. This cannot be undone.`
            : t`With no other channel to move its chats to, only an empty channel can be deleted. This cannot be undone.`
        }
        onConfirmClick={() =>
          void deleteAgentChatChannel({
            channelId: channel.id,
            destinationChannelId: deleteDestinationChannelId,
          })
        }
        confirmButtonText={t`Delete channel`}
      />
    </>
  );
};
