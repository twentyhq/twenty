import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadViewEffect } from '@/ai-chat/instance/components/AiChatThreadViewEffect';
import { SidePanelAiChatToolCallPageContent } from '@/side-panel/pages/ai-chat-tool-call/components/SidePanelAiChatToolCallPageContent';
import { sidePanelAiChatToolCallComponentState } from '@/side-panel/pages/ai-chat-tool-call/states/sidePanelAiChatToolCallComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SidePanelAiChatToolCallPage = () => {
  const sidePanelAiChatToolCall = useAtomComponentStateValue(
    sidePanelAiChatToolCallComponentState,
  );

  if (!isDefined(sidePanelAiChatToolCall)) {
    return null;
  }

  const { threadId, toolCallId } = sidePanelAiChatToolCall;

  return (
    <>
      <AiChatThreadViewEffect threadId={threadId} />
      <SidePanelAiChatToolCallPageContent
        threadId={threadId}
        toolCallId={toolCallId}
      />
    </>
  );
};
