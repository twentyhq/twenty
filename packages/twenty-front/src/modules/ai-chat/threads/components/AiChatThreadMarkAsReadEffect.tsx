import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { getAgentChatThreadInboxStatus } from 'twenty-shared/ai';

import { useUpdateAiChatThreadStatus } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadStatus';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import {
  type AiChatThreadVisit,
  aiChatThreadVisitFamilyState,
} from '@/ai-chat/threads/states/aiChatThreadVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

const isDocumentVisible = () => document.visibilityState === 'visible';

export const AiChatThreadMarkAsReadEffect = () => {
  const store = useStore();
  const { threadId: aiChatThreadId } = useAiChatInstanceOrThrow();
  const threadId = isValidUuid(aiChatThreadId) ? aiChatThreadId : null;
  const lastActivityAt = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId ?? '',
  )?.lastActivityAt;
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(isDocumentVisible());

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (
      !isDefined(threadId) ||
      !isVisible ||
      !isDefined(aiChatThreadParticipants) ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const participant = aiChatThreadParticipants[threadId];
    const { isUnread } = getAgentChatThreadInboxStatus({
      lastActivityAt,
      participant,
    });
    const visitAtom = aiChatThreadVisitFamilyState.atomFamily({ threadId });
    const storedVisit = store.get(visitAtom);

    // Taken once per visit, before the read mark, so it sees where the member
    // left off
    const newVisit: AiChatThreadVisit = {
      threadId,
      isUnread,
      lastReadAt: participant?.lastReadAt ?? null,
      isKeptUnread: false,
    };
    const visit = storedVisit?.threadId === threadId ? storedVisit : newVisit;

    if (visit !== storedVisit) {
      store.set(visitAtom, visit);
    }

    const isReadRequested =
      visit.readRequestedForActivityAt === lastActivityAt &&
      visit.readRequestedForParticipantUpdatedAt === participant?.updatedAt;

    // Opening a chat the member does not participate in yet starts tracking
    // it for them, so later activity in it reads as unread
    if (
      (!isUnread && isDefined(participant)) ||
      visit.isKeptUnread ||
      isReadRequested
    ) {
      return;
    }

    store.set(visitAtom, {
      ...visit,
      readRequestedForActivityAt: lastActivityAt,
      readRequestedForParticipantUpdatedAt: participant?.updatedAt,
    });

    void updateAgentChatThreadInboxState({
      threadIds: [threadId],
      action: AgentChatInboxAction.READ,
    });
  }, [
    isVisible,
    lastActivityAt,
    aiChatThreadParticipants,
    updateAgentChatThreadInboxState,
    store,
    threadId,
  ]);

  return null;
};
