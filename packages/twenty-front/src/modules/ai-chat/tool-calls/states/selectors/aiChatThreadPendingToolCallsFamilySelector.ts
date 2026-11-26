import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadIsStreamingFamilySelector';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadPendingToolCallsFamilySelector =
  createAtomFamilySelector<
    AiChatPendingToolCall[],
    { threadId: string | null }
  >({
    key: 'aiChatThreadPendingToolCallsFamilySelector',
    get:
      ({ threadId }) =>
      ({ get }) =>
        get(aiChatThreadIsStreamingFamilySelector, { threadId })
          ? []
          : get(aiChatThreadDisplayedMessagesFamilyState, {
              threadId,
            }).flatMap((message) =>
              message.parts
                .map(parsePendingToolCall)
                .filter((pendingToolCall) => isDefined(pendingToolCall)),
            ),
  });
