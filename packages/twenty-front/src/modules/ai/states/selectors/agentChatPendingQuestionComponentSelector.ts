import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionsToolResult,
} from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

// The displayed thread's unanswered `ask_questions` call, if any. Derived from
// the persisted messages so it survives refresh and is naturally scoped to its
// own thread. Returns null once answered (status !== 'pending') or superseded by
// a later assistant message.
export const agentChatPendingQuestionComponentSelector =
  createAtomComponentSelector<AgentChatPendingQuestion | null>({
    key: 'agentChatPendingQuestionComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentThreadId = get(agentChatDisplayedThreadState);

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId: currentThreadId },
        });

        const lastAssistantMessage = [...messages]
          .reverse()
          .find((message) => message.role === 'assistant');

        if (!lastAssistantMessage) {
          return null;
        }

        for (const part of lastAssistantMessage.parts) {
          if (
            !isToolUIPart(part) ||
            getToolName(part) !== ASK_QUESTIONS_TOOL_NAME
          ) {
            continue;
          }

          const result = (part.output as { result?: AskQuestionsToolResult })
            ?.result;

          if (result?.status === 'pending') {
            return {
              messageId: lastAssistantMessage.id,
              toolCallId: part.toolCallId,
              questions: result.questions,
            };
          }
        }

        return null;
      },
  });
