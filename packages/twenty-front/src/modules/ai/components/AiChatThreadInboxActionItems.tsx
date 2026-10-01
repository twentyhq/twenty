import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { Dropdown } from 'twenty-ui/components';
import {
  IconArchive,
  IconClock,
  IconEye,
  IconEyeOff,
  IconInbox,
} from 'twenty-ui/icon';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { getAgentChatThreadSnoozeOptions } from '@/ai/utils/getAgentChatThreadSnoozeOptions';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type AiChatThreadInboxActionItemsProps = {
  threadId: string;
};

const formatSnoozeTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

export const AiChatThreadInboxActionItems = ({
  threadId,
}: AiChatThreadInboxActionItemsProps) => {
  const { t } = useLingui();
  const { scope, isUnread } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    threadId,
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
          startIcon={<IconArchive />}
          onClick={runAction(() => archiveAgentChatThread(threadId))}
        >
          {t`Archive`}
        </Dropdown.ActionItem>
      ) : (
        <Dropdown.ActionItem
          startIcon={<IconInbox />}
          onClick={runAction(() => moveAgentChatThreadToInbox(threadId))}
        >
          {t`Move to inbox`}
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
                onClick={runAction(() =>
                  snoozeAgentChatThread(threadId, option.date),
                )}
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
