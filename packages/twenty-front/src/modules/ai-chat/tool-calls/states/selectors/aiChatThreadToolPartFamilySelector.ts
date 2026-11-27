import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { findToolPart } from '@/ai-chat/tool-calls/utils/findToolPart';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadToolPartFamilySelector = createAtomFamilySelector<
  ToolUIPart | DynamicToolUIPart | undefined,
  { threadId: string; toolCallId: string }
>({
  key: 'aiChatThreadToolPartFamilySelector',
  get:
    ({ threadId, toolCallId }) =>
    ({ get }) =>
      findToolPart({
        messages: get(aiChatThreadDisplayedMessagesFamilyState, { threadId }),
        toolCallId,
      }),
});
