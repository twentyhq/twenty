import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import {
  IconCircleDashed,
  IconClock,
  IconEye,
  IconEyeOff,
  IconProgressCheck,
} from 'twenty-ui/icon';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import {
  type AgentChatThreadSnoozeOption,
  getAgentChatThreadSnoozeOptions,
} from '@/ai/utils/getAgentChatThreadSnoozeOptions';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type AiChatThreadInboxActionItemsProps = {
  thread: Pick<AgentChatThreadRecord, 'id' | 'lastActivityAt'>;
};

const formatSnoozeTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

export const AiChatThreadInboxActionItems = ({
  thread,
}: AiChatThreadInboxActionItemsProps) => {
  const { t } = useLingui();
  const threadId = thread.id;
  const { scope, isUnread } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    { threadId, lastActivityAt: thread.lastActivityAt ?? null },
  );
  const {
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    snoozeAgentChatThread,
    moveAgentChatThreadToInbox,
  } = useAgentChatThreadParticipants();

  const runAction = (action: () => Promise<void>) => (event: MouseEvent) => {
    event.stopPropagation();
    void action();
  };

  const snoozeOptions = getAgentChatThreadSnoozeOptions(new Date());

  // The menu can stay open past an option's time, so the time is taken again
  // on click
  const snoozeUntilOption = async (
    optionKey: AgentChatThreadSnoozeOption['key'],
  ) => {
    const option = getAgentChatThreadSnoozeOptions(new Date()).find(
      ({ key }) => key === optionKey,
    );

    if (isDefined(option)) {
      await snoozeAgentChatThread(threadId, option.date);
    }
  };

  return (
    <>
      {isUnread ? (
        <Dropdown.ActionItem
          startIcon={<IconEye />}
          onClick={runAction(() => markAgentChatThreadAsRead(threadId))}
        >
          {t`Mark as read`}
        </Dropdown.ActionItem>
      ) : (
        <Dropdown.ActionItem
          startIcon={<IconEyeOff />}
          onClick={runAction(() => markAgentChatThreadAsUnread(threadId))}
        >
          {t`Mark as unread`}
        </Dropdown.ActionItem>
      )}
      {scope === 'INBOX' ? (
        <Dropdown.ActionItem
          startIcon={<IconProgressCheck />}
          onClick={runAction(() => archiveAgentChatThread(threadId))}
        >
          {t`Mark as done`}
        </Dropdown.ActionItem>
      ) : (
        <Dropdown.ActionItem
          startIcon={<IconCircleDashed />}
          onClick={runAction(() => moveAgentChatThreadToInbox(threadId))}
        >
          {t`Reopen`}
        </Dropdown.ActionItem>
      )}
      <Dropdown.Submenu>
        <Dropdown.SubmenuTrigger
          aria-label={t`Snooze`}
          startIcon={<IconClock />}
        >
          {t`Snooze`}
        </Dropdown.SubmenuTrigger>
        <Dropdown.Content aria-label={t`Snooze`}>
          <Dropdown.Section>
            {snoozeOptions.map((option) => (
              <Dropdown.ActionItem
                key={option.key}
                description={formatSnoozeTime(option.date)}
                descriptionPlacement="end"
                onClick={runAction(() => snoozeUntilOption(option.key))}
              >
                {t(option.label)}
              </Dropdown.ActionItem>
            ))}
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Submenu>
    </>
  );
};
