import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Adopts the thread named by the URL. This runs one way only: selecting a
// thread writes the URL itself (useProjectAiChatThreadToUrl), so by the time
// this sees a param it already matches and does nothing. What it exists for
// is navigation the app did not perform — a deep link, and the browser's back
// and forward buttons — which is an external system and so genuinely an
// effect. A param that names nothing valid is ignored; the selection stands
// and the URL is left as the user typed it.
export const AiChatPageThreadUrlSyncEffect = () => {
  const { threadId } = useParams();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  useEffect(() => {
    if (!isDefined(threadId) || !isValidUuid(threadId)) {
      return;
    }

    if (threadId === currentAiChatThread) {
      return;
    }

    switchThreadWithDraft(threadId);
  }, [threadId, currentAiChatThread, switchThreadWithDraft]);

  return null;
};
