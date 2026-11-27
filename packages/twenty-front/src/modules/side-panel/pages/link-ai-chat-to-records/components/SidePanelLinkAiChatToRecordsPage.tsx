import { isDefined } from 'twenty-shared/utils';

import { SidePanelLinkAiChatToRecordsList } from '@/side-panel/pages/link-ai-chat-to-records/components/SidePanelLinkAiChatToRecordsList';
import { aiChatThreadIdComponentState } from '@/side-panel/states/aiChatThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SidePanelLinkAiChatToRecordsPage = () => {
  const aiChatThreadId = useAtomComponentStateValue(
    aiChatThreadIdComponentState,
  );

  if (!isDefined(aiChatThreadId)) {
    return null;
  }

  return <SidePanelLinkAiChatToRecordsList threadId={aiChatThreadId} />;
};
