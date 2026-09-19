import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconMessage } from 'twenty-ui/icon';
import { MenuItem, MenuItemSelect } from 'twenty-ui/primitives/navigation';

import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type AiChatThreadMoveToChannelMenuProps = {
  threadId: string;
  currentChannelId: string | null;
  dropdownId: string;
  onBack: () => void;
};

export const AiChatThreadMoveToChannelMenu = ({
  threadId,
  currentChannelId,
  dropdownId,
  onBack,
}: AiChatThreadMoveToChannelMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { joinedChannels } = useChatChannels();
  const { setChatThreadChannel } = useChatChannelActions();

  const handleSelect = async (channelId: string | null) => {
    closeDropdown(dropdownId);
    onBack();

    if (channelId !== currentChannelId) {
      await setChatThreadChannel({ threadId, channelId });
    }
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Move to channel`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer hasMaxHeight>
        <MenuItemSelect
          LeftIcon={IconMessage}
          text={t`No channel`}
          selected={!isDefined(currentChannelId)}
          onClick={() => handleSelect(null)}
        />
        {joinedChannels.length > 0 && <DropdownMenuSeparator />}
        {joinedChannels.length === 0 ? (
          <MenuItem disabled text={t`Join a channel first`} />
        ) : (
          joinedChannels.map((channel) => (
            <MenuItemSelect
              key={channel.id}
              LeftIcon={getAiChatChannelIcon(channel.visibility)}
              text={channel.name}
              selected={channel.id === currentChannelId}
              onClick={() => handleSelect(channel.id)}
            />
          ))
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
