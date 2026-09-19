import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { AgentChatThreadStatus } from '~/generated-metadata/graphql';

// A snooze that has come due is nothing but an open thread again. The server
// leaves the row alone so no job has to sweep the table, which makes the due
// date something every reader has to apply for itself.
export const getAgentChatThreadInboxState = (
  thread: Pick<FlatAgentChatThread, 'status' | 'snoozedUntil'>,
  now: number = Date.now(),
): AgentChatThreadInboxState => {
  if (thread.status === AgentChatThreadStatus.DONE) {
    return AGENT_CHAT_THREAD_INBOX_STATE.DONE;
  }

  if (thread.status === AgentChatThreadStatus.SNOOZED) {
    const snoozedUntilMs = isDefined(thread.snoozedUntil)
      ? new Date(thread.snoozedUntil).getTime()
      : null;

    if (isDefined(snoozedUntilMs) && snoozedUntilMs > now) {
      return AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED;
    }
  }

  return AGENT_CHAT_THREAD_INBOX_STATE.OPEN;
};
