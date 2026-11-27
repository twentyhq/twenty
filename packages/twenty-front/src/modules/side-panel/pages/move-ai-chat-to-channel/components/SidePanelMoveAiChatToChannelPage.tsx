import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconInbox } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatChannelIcon } from '@/ai-chat/threads/components/AiChatChannelIcon';
import { aiChatAccessibleChannelsSelector } from '@/ai-chat/threads/states/selectors/aiChatAccessibleChannelsSelector';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useMoveInboxThreadToChannel } from '@/inbox/hooks/useMoveInboxThreadToChannel';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelMoveAiChatToChannelItem } from '@/side-panel/pages/move-ai-chat-to-channel/components/SidePanelMoveAiChatToChannelItem';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { aiChatThreadIdComponentState } from '@/side-panel/states/aiChatThreadIdComponentState';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const NO_CHANNEL_ITEM_ID = 'no-channel';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const SidePanelMoveAiChatToChannelPage = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const aiChatThreadId = useAtomComponentStateValue(
    aiChatThreadIdComponentState,
  );
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    aiChatThreadId ?? '',
  );
  const aiChatAccessibleChannels = useAtomStateValue(
    aiChatAccessibleChannelsSelector,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { moveInboxThreadToChannel } = useMoveInboxThreadToChannel();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const [search, setSearch] = useState('');

  if (!isDefined(aiChatThreadId) || !isDefined(thread)) {
    return null;
  }

  const currentChannelId = thread.channelId ?? null;
  const normalizedSearch = search.trim().toLowerCase();
  const channels = aiChatAccessibleChannels.filter(({ name }) =>
    name.toLowerCase().includes(normalizedSearch),
  );
  const isNoChannelShown =
    isDefined(thread.workspaceMemberId) &&
    thread.workspaceMemberId === currentWorkspaceMember?.id &&
    normalizedSearch === '';

  const hasOptions = isNoChannelShown || channels.length > 0;

  const handleMove = (channelId: string | null) => {
    void closeSidePanelMenu();

    if (channelId !== currentChannelId) {
      void moveInboxThreadToChannel({ threadId: aiChatThreadId, channelId });
    }
  };

  return (
    <>
      <StyledSearchContainer>
        <DropdownMenuSearchInput
          value={search}
          placeholder={t`Search channels`}
          onChange={(event) => setSearch(event.target.value)}
        />
      </StyledSearchContainer>
      <SidePanelList
        selectableItemIds={[
          ...(isNoChannelShown ? [NO_CHANNEL_ITEM_ID] : []),
          ...channels.map(({ id }) => id),
        ]}
        noResults={!hasOptions}
        noResultsText={t`No channels match your search`}
      >
        {hasOptions && (
          <SidePanelGroup heading={t`Channels`}>
            {isNoChannelShown && (
              <SelectableListItem
                itemId={NO_CHANNEL_ITEM_ID}
                onEnter={() => handleMove(null)}
              >
                <SidePanelMoveAiChatToChannelItem
                  id={NO_CHANNEL_ITEM_ID}
                  icon={
                    <ColoredIcon Icon={IconInbox} size={theme.icon.size.md} />
                  }
                  label={t`No channel`}
                  isCurrent={!isDefined(currentChannelId)}
                  onSelect={() => handleMove(null)}
                />
              </SelectableListItem>
            )}
            {channels.map((channel) => (
              <SelectableListItem
                key={channel.id}
                itemId={channel.id}
                onEnter={() => handleMove(channel.id)}
              >
                <SidePanelMoveAiChatToChannelItem
                  id={channel.id}
                  icon={
                    <AiChatChannelIcon
                      channel={channel}
                      size={theme.icon.size.md}
                    />
                  }
                  label={channel.name}
                  isCurrent={channel.id === currentChannelId}
                  onSelect={() => handleMove(channel.id)}
                />
              </SelectableListItem>
            ))}
          </SidePanelGroup>
        )}
      </SidePanelList>
    </>
  );
};
