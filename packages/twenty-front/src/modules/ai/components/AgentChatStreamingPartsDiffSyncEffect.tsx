import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AgentChatStreamingPartsDiffSyncEffect = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);

  const inboxMessages = useAtomFamilyStateValue(inboxMessagesFamilyState, {
    threadId: currentInboxThread,
  });

  const { updateStreamingPartsWithDiff } = useUpdateStreamingPartsWithDiff();

  useEffect(() => {
    if (inboxMessages.length === 0) {
      return;
    }

    updateStreamingPartsWithDiff(inboxMessages);
  }, [inboxMessages, updateStreamingPartsWithDiff]);

  return null;
};
