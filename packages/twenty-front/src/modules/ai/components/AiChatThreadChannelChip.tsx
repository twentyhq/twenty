import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowRight } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadMoveToChannelMenu } from '@/ai/components/AiChatThreadMoveToChannelMenu';
import { useAiChatThreadById } from '@/ai/hooks/useAiChatThreadById';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { useIsCurrentUserAiChatThreadOwner } from '@/ai/hooks/useIsCurrentUserAiChatThreadOwner';
import { useNavigateToAiChatChannelPage } from '@/ai/hooks/useNavigateToAiChatChannelPage';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const StyledChip = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type AiChatThreadChannelChipProps = {
  threadId: string;
  channelId: string | null | undefined;
};

export const AiChatThreadChannelChip = ({
  threadId,
  channelId,
}: AiChatThreadChannelChipProps) => {
  const { t } = useLingui();
  const { findChannelById } = useChatChannels();
  const { navigateToAiChatChannelPage } = useNavigateToAiChatChannelPage();
  const { closeDropdown } = useCloseDropdown();
  const { isOwner, isKnown } = useIsCurrentUserAiChatThreadOwner(threadId);
  const thread = useAiChatThreadById(threadId);
  const [isMoving, setIsMoving] = useState(false);
  const channel = findChannelById(channelId);
  const dropdownId = `ai-chat-thread-channel-chip-${threadId}`;

  if (!isDefined(channel)) {
    return null;
  }

  const Icon = getAiChatChannelIcon(channel.visibility);
  const chip = (
    <StyledChip type="button" title={channel.name}>
      <Icon size={12} />
      {channel.name}
    </StyledChip>
  );

  // Moving is owner-only on the server and refused outright on a run
  // conversation, so a reader who cannot move the thread keeps the chip as
  // the shortcut to the channel it is in.
  const canMoveThread =
    (!isKnown || isOwner) && !isDefined(thread?.workflowRunId);

  if (!canMoveThread) {
    return (
      <StyledChip
        type="button"
        title={channel.name}
        onClick={() => navigateToAiChatChannelPage(channel.id)}
      >
        <Icon size={12} />
        {channel.name}
      </StyledChip>
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      onClose={() => setIsMoving(false)}
      clickableComponent={chip}
      dropdownComponents={
        isMoving ? (
          <AiChatThreadMoveToChannelMenu
            threadId={threadId}
            currentChannelId={channel.id}
            dropdownId={dropdownId}
            onBack={() => setIsMoving(false)}
          />
        ) : (
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={Icon}
                text={t`Open ${channel.name}`}
                onClick={() => {
                  closeDropdown(dropdownId);
                  navigateToAiChatChannelPage(channel.id);
                }}
              />
            </DropdownMenuItemsContainer>
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={IconArrowRight}
                text={t`Move to another channel`}
                hasSubMenu
                onClick={() => setIsMoving(true)}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        )
      }
    />
  );
};
