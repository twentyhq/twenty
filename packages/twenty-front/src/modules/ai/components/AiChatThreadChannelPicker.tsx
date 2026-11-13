import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFolderSymlink } from 'twenty-ui/icon';

import { useMoveInboxThreadToChannel } from '@/ai/hooks/useMoveAgentChatThreadToChannel';
import { inboxAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type InboxThreadChannelPickerProps = {
  thread: AiChatThreadRecord;
  dropdownId: string;
};

// A chat without an owner has no one to fall back to, so it stays in a channel
export const InboxThreadChannelPicker = ({
  thread,
  dropdownId,
}: InboxThreadChannelPickerProps) => {
  const { t } = useLingui();
  const inboxAccessibleChannels = useAtomStateValue(
    inboxAccessibleChannelsSelector,
  );
  const { moveAgentChatThreadToChannel } = useMoveInboxThreadToChannel();
  const currentChannelId = thread.channelId ?? null;
  const canLeaveChannels = isDefined(thread.workspaceMemberId);

  if (inboxAccessibleChannels.length === 0 && !isDefined(currentChannelId)) {
    return null;
  }

  const options = [
    ...(canLeaveChannels ? [{ id: null, name: t`No channel` }] : []),
    ...inboxAccessibleChannels.map(({ id, name }) => ({ id, name })),
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
            <Dropdown.OptionItem
              key={id ?? 'none'}
              selected={id === currentChannelId}
              onSelect={() => {
                if (id !== currentChannelId) {
                  void moveAgentChatThreadToChannel({
                    threadId: thread.id,
                    channelId: id,
                  });
                }
              }}
            >
              {name}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
