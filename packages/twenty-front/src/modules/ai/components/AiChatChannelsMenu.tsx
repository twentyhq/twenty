import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconChevronLeft,
  IconDotsVertical,
  IconLock,
  IconPlus,
  IconWorld,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { MenuItem, MenuItemSelect } from 'twenty-ui/primitives/navigation';

import { AiChatChannelNameForm } from '@/ai/components/AiChatChannelNameForm';
import {
  AI_CHAT_CHANNELS_MENU_PAGE,
  type AiChatChannelsMenuPage,
} from '@/ai/constants/AiChatChannelsMenuPage';
import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { AgentChatChannelVisibility } from '~/generated-metadata/graphql';

export const AI_CHAT_CHANNELS_MENU_DROPDOWN_ID = 'ai-chat-channels-menu';

export const AiChatChannelsMenu = () => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [page, setPage] = useState<AiChatChannelsMenuPage>(
    AI_CHAT_CHANNELS_MENU_PAGE.ROOT,
  );
  const [visibility, setVisibility] = useState<AgentChatChannelVisibility>(
    AgentChatChannelVisibility.PUBLIC,
  );
  const { browsableChannels } = useChatChannels();
  const { createChatChannel, joinChatChannel } = useChatChannelActions();

  const goToRoot = () => setPage(AI_CHAT_CHANNELS_MENU_PAGE.ROOT);

  const handleCreate = async (name: string) => {
    const channel = await createChatChannel({ name, visibility });

    if (channel) {
      closeDropdown(AI_CHAT_CHANNELS_MENU_DROPDOWN_ID);
      goToRoot();
    }
  };

  const handleJoin = async (channelId: string) => {
    await joinChatChannel(channelId);
    closeDropdown(AI_CHAT_CHANNELS_MENU_DROPDOWN_ID);
    goToRoot();
  };

  const renderPage = () => {
    switch (page) {
      case AI_CHAT_CHANNELS_MENU_PAGE.CREATE:
        return (
          <AiChatChannelNameForm
            title={t`New channel`}
            submitLabel={t`Create channel`}
            onBack={goToRoot}
            onSubmit={handleCreate}
          >
            <MenuItemSelect
              LeftIcon={IconWorld}
              text={t`Public`}
              contextualText={t`Anyone in the workspace can join`}
              selected={visibility === AgentChatChannelVisibility.PUBLIC}
              onClick={() => setVisibility(AgentChatChannelVisibility.PUBLIC)}
            />
            <MenuItemSelect
              LeftIcon={IconLock}
              text={t`Private`}
              contextualText={t`Invite only`}
              selected={visibility === AgentChatChannelVisibility.PRIVATE}
              onClick={() => setVisibility(AgentChatChannelVisibility.PRIVATE)}
            />
          </AiChatChannelNameForm>
        );
      case AI_CHAT_CHANNELS_MENU_PAGE.BROWSE:
        return (
          <DropdownContent>
            <DropdownMenuHeader
              StartComponent={
                <DropdownMenuHeaderLeftComponent
                  onClick={goToRoot}
                  Icon={IconChevronLeft}
                />
              }
            >
              {t`Browse channels`}
            </DropdownMenuHeader>
            <DropdownMenuItemsContainer hasMaxHeight>
              {browsableChannels.length === 0 ? (
                <MenuItem disabled text={t`No channel to join`} />
              ) : (
                browsableChannels.map((channel) => (
                  <MenuItem
                    key={channel.id}
                    LeftIcon={getAiChatChannelIcon(channel.visibility)}
                    text={channel.name}
                    contextualText={t`Join`}
                    contextualTextPosition="right"
                    onClick={() => handleJoin(channel.id)}
                  />
                ))
              )}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        );
      case AI_CHAT_CHANNELS_MENU_PAGE.ROOT:
      default:
        return (
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={IconPlus}
                text={t`New channel`}
                onClick={() => setPage(AI_CHAT_CHANNELS_MENU_PAGE.CREATE)}
              />
              <MenuItem
                LeftIcon={IconWorld}
                text={t`Browse channels`}
                contextualText={
                  browsableChannels.length > 0
                    ? String(browsableChannels.length)
                    : undefined
                }
                contextualTextPosition="right"
                onClick={() => setPage(AI_CHAT_CHANNELS_MENU_PAGE.BROWSE)}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        );
    }
  };

  return (
    <Dropdown
      dropdownId={AI_CHAT_CHANNELS_MENU_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      onClose={goToRoot}
      clickableComponent={
        <LightIconButton
          aria-label={t`Channel options`}
          Icon={IconDotsVertical}
          accent="tertiary"
          size="small"
        />
      }
      dropdownComponents={renderPage()}
    />
  );
};
