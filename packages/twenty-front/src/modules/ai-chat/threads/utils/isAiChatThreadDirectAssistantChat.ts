import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export const isAiChatThreadDirectAssistantChat = (
  thread: Pick<
    AiChatThreadRecord,
    | 'conversationType'
    | 'isAssistantParticipant'
    | 'channelId'
    | 'workspaceMemberId'
    | 'writerWorkspaceMemberIds'
  >,
): boolean =>
  thread.conversationType === AgentChatThreadConversationType.STANDARD &&
  thread.isAssistantParticipant === true &&
  !isDefined(thread.channelId) &&
  (thread.writerWorkspaceMemberIds ?? []).every(
    (writerWorkspaceMemberId) =>
      writerWorkspaceMemberId === thread.workspaceMemberId,
  );
