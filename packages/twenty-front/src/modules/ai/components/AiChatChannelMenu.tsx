import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconDotsVertical,
  IconLogout,
  IconPencil,
  IconTrash,
  IconUsers,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { AiChatChannelMembersDropdownContent } from '@/ai/components/AiChatChannelMembersDropdownContent';
import {
  AiChatChannelForm,
  type AiChatChannelFormValues,
} from '@/ai/components/AiChatChannelForm';
import { AI_CHAT_CHANNEL_DELETE_MODAL_ID } from '@/ai/constants/AiChatChannelDeleteModalId';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import {
  AI_CHAT_CHANNEL_MENU_PAGE,
  type AiChatChannelMenuPage,
} from '@/ai/constants/AiChatChannelMenuPage';
import { useAiChatChannelIdFromPath } from '@/ai/hooks/useAiChatChannelIdFromPath';
import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { aiChatChannelPendingDeleteState } from '@/ai/states/aiChatChannelPendingDeleteState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { AgentChatChannelVisibility } from '~/generated-metadata/graphql';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// The same channel's menu is mounted in the sidebar and on its page at the
// same time, so the dropdown id carries the surface to open only one of them.
export const getAiChatChannelMenuDropdownId = ({
  channelId,
  surface,
}: {
  channelId: string;
  surface: AiChatThreadActionsSurface;
}) => `ai-chat-channel-menu-${surface}-${channelId}`;

type AiChatChannelMenuProps = {
  channel: FlatAgentChatChannel;
  surface: AiChatThreadActionsSurface;
};

export const AiChatChannelMenu = ({
  channel,
  surface,
}: AiChatChannelMenuProps) => {
  const { t } = useLingui();
  const dropdownId = getAiChatChannelMenuDropdownId({
    channelId: channel.id,
    surface: surface,
  });
  const { closeDropdown } = useCloseDropdown();
  const { openDialog } = useDialog();
  const [page, setPage] = useState<AiChatChannelMenuPage>(
    AI_CHAT_CHANNEL_MENU_PAGE.ROOT,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { isCurrentUserChannelAdmin, isCurrentUserChannelMember } =
    useChatChannels();
  const { updateChatChannel, leaveChatChannel } = useChatChannelActions();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();
  const currentChannelId = useAiChatChannelIdFromPath();
  const setAiChatChannelPendingDelete = useSetAtomState(
    aiChatChannelPendingDeleteState,
  );

  const isAdmin = isCurrentUserChannelAdmin(channel.id);
  // Someone reading the channel through a role has no membership to leave.
  const isMember = isCurrentUserChannelMember(channel.id);
  const goToRoot = () => setPage(AI_CHAT_CHANNEL_MENU_PAGE.ROOT);

  const handleEdit = async ({ name, description }: AiChatChannelFormValues) => {
    const updatedChannel = await updateChatChannel(channel.id, {
      name,
      description,
    });

    if (isDefined(updatedChannel)) {
      closeDropdown(dropdownId);
      goToRoot();
    }
  };

  const handleLeave = async (event: React.MouseEvent) => {
    event.stopPropagation();
    closeDropdown(dropdownId);

    if (!isDefined(currentWorkspaceMember?.userWorkspaceId)) {
      return;
    }

    const hasLeft = await leaveChatChannel({
      channelId: channel.id,
      userWorkspaceId: currentWorkspaceMember.userWorkspaceId,
    });

    // Leaving a private channel revokes access to its page.
    if (
      hasLeft &&
      channel.visibility === AgentChatChannelVisibility.PRIVATE &&
      currentChannelId === channel.id
    ) {
      navigateToAiChatPage();
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeDropdown(dropdownId);
    setAiChatChannelPendingDelete({
      channelId: channel.id,
      channelName: channel.name,
    });
    openDialog(AI_CHAT_CHANNEL_DELETE_MODAL_ID);
  };

  const renderPage = () => {
    switch (page) {
      case AI_CHAT_CHANNEL_MENU_PAGE.MEMBERS:
        return (
          <AiChatChannelMembersDropdownContent
            channelId={channel.id}
            onBack={goToRoot}
          />
        );
      case AI_CHAT_CHANNEL_MENU_PAGE.EDIT:
        return (
          <AiChatChannelForm
            title={t`Edit channel`}
            initialName={channel.name}
            initialDescription={channel.description}
            submitLabel={t`Save`}
            onBack={goToRoot}
            onSubmit={handleEdit}
          />
        );
      case AI_CHAT_CHANNEL_MENU_PAGE.ROOT:
      default:
        return (
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <MenuItem
                text={t`Members`}
                LeftIcon={IconUsers}
                onClick={() => setPage(AI_CHAT_CHANNEL_MENU_PAGE.MEMBERS)}
              />
              {isAdmin && (
                <MenuItem
                  text={t`Edit channel`}
                  LeftIcon={IconPencil}
                  onClick={() => setPage(AI_CHAT_CHANNEL_MENU_PAGE.EDIT)}
                />
              )}
              {isMember && (
                <MenuItem
                  text={t`Leave channel`}
                  LeftIcon={IconLogout}
                  onClick={handleLeave}
                />
              )}
              {isAdmin && (
                <MenuItem
                  accent="danger"
                  text={t`Delete channel`}
                  LeftIcon={IconTrash}
                  onClick={handleDelete}
                />
              )}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        );
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClose={goToRoot}
      clickableComponent={
        <LightIconButton
          aria-label={t`Channel actions`}
          Icon={IconDotsVertical}
          accent="tertiary"
          size="small"
        />
      }
      dropdownComponents={renderPage()}
    />
  );
};
