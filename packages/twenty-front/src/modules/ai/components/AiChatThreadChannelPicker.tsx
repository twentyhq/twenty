import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCheck, IconFolderSymlink } from 'twenty-ui/icon';

import { useMoveAgentChatThreadToChannel } from '@/ai/hooks/useMoveAgentChatThreadToChannel';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatThreadChannelPickerProps = {
  thread: AgentChatThreadRecord;
  dropdownId: string;
};

// Chats move between the channels the member joined. A chat without an owner
// has no one to fall back to, so it stays in a channel
export const AiChatThreadChannelPicker = ({
  thread,
  dropdownId,
}: AiChatThreadChannelPickerProps) => {
  const { t } = useLingui();
  const channels = useAtomStateValue(agentChatChannelsState) ?? [];
  const { moveAgentChatThreadToChannel } = useMoveAgentChatThreadToChannel();
  const joinedChannels = channels.filter(({ isMember }) => isMember);
  const currentChannelId = thread.channelId ?? null;
  const canLeaveChannels = isDefined(thread.workspaceMemberId);

  if (joinedChannels.length === 0 && !isDefined(currentChannelId)) {
    return null;
  }

  const options = [
    ...(canLeaveChannels ? [{ id: null, name: t`No channel` }] : []),
    ...joinedChannels.map(({ id, name }) => ({ id, name })),
  ];

  return (
    <DropdownRoot type="picker" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Move to channel`}
            title={t`Move to channel`}
            emphasis="subtle"
          >
            <IconFolderSymlink />
          </LightIconButton>
        }
      />
      <DropdownContent side="bottom" align="end">
        <Dropdown.Section label={t`Move to channel`} scrollable>
          {options.map(({ id, name }) => (
            <Dropdown.ActionItem
              key={id ?? 'none'}
              endIcon={id === currentChannelId ? <IconCheck /> : undefined}
              onClick={() => {
                if (id !== currentChannelId) {
                  void moveAgentChatThreadToChannel(thread.id, id);
                }
              }}
            >
              {name}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
