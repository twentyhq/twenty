import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type MouseEvent, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { parseThemeColor } from 'twenty-ui/utilities';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { NavigationDrawerAiChatChannelActionsDropdown } from '@/ai/components/NavigationDrawerAiChatChannelActionsDropdown';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { useDeleteAgentChatChannel } from '@/ai/hooks/useDeleteAgentChatChannel';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { useUpdateAgentChatChannel } from '@/ai/hooks/useUpdateAgentChatChannel';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemEditingContext } from '@/ui/navigation/navigation-drawer/contexts/NavigationDrawerItemEditingContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatChannel } from '~/generated-metadata/graphql';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

const StyledIconPickerTrigger = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
`;

// The picker opens from the icon, so its clicks must not open the channel
const stopPropagation = (event: MouseEvent) => event.stopPropagation();

type NavigationDrawerAiChatChannelItemProps = {
  channel: AgentChatChannel;
  summary: AgentChatChannelSummary | undefined;
  destinationChannels: AgentChatChannel[];
  canManage: boolean;
};

export const NavigationDrawerAiChatChannelItem = ({
  channel,
  summary,
  destinationChannels,
  canManage,
}: NavigationDrawerAiChatChannelItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const instanceId = useId();
  const dropdownId = `ai-chat-channel-actions-${instanceId}`;
  const iconPickerDropdownId = `ai-chat-channel-icon-${instanceId}`;
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
  const { updateAgentChatChannel } = useUpdateAgentChatChannel();
  const { deleteAgentChatChannel } = useDeleteAgentChatChannel();
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
  const openCount = summary?.openCount ?? 0;
  const openCountLabel = openCount > 0 ? `${openCount}` : undefined;
  const secondaryLabel = channel.isAccessible
    ? openCountLabel
    : t`Not open to you`;
  const coloredIcon = <AgentChatChannelIcon channel={channel} />;

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
      <NavigationDrawerItemEditingContext.Provider
        value={{ icon, label: undefined, isSelected: false }}
      >
        <NavigationDrawerItem
          label={channel.name}
          secondaryLabel={secondaryLabel}
          variant={channel.isAccessible ? 'default' : 'tertiary'}
          isUnread={summary?.hasUnreadOpen}
          active={
            isAiChatInboxPath(location.pathname) &&
            agentChatShownChannelView?.channelId === channel.id
          }
          onClick={
            channel.isAccessible
              ? () => openAgentChatChannel(channel.id)
              : undefined
          }
          triggerEvent="CLICK"
          isRightOptionsDropdownOpen={isDropdownOpen}
          rightOptions={
            canManage || channel.isAccessible ? (
              <NavigationDrawerAiChatChannelActionsDropdown
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
      </NavigationDrawerItemEditingContext.Provider>
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
