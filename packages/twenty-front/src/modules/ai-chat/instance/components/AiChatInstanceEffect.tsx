import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { getAgentChatThreadInboxStatus } from 'twenty-shared/ai';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useListenToAiChatThreadEvents } from '@/ai-chat/instance/hooks/useListenToAiChatThreadEvents';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatUISessionStartTimeState } from '@/ai-chat/states/aiChatUISessionStartTimeState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadIsMissingFamilyState } from '@/ai-chat/states/server/aiChatThreadIsMissingFamilyState';
import { aiChatThreadViewOpenCountFamilyState } from '@/ai-chat/states/view/aiChatThreadViewOpenCountFamilyState';
import {
  type AiChatThreadVisit,
  aiChatThreadViewVisitFamilyState,
} from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import { useUpdateAiChatThreadStatus } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadStatus';
import { aiChatReopenedThreadActivityState } from '@/ai-chat/threads/states/aiChatReopenedThreadActivityState';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatThreadSettledForMember } from '@/ai-chat/threads/utils/isAiChatThreadSettledForMember';
import { useProcessWorkspaceSetupCompletion } from '@/ai-chat/workspace-setup/hooks/useProcessWorkspaceSetupCompletion';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

const isDocumentVisible = () => document.visibilityState === 'visible';

// Everything a chat does because it is on screen; thread data lives in AiChatThreadStreamsEffect
export const AiChatInstanceEffect = () => {
  const store = useStore();
  const { instanceId, threadId, onThreadChange } = useAiChatInstanceOrThrow();
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();
  const { processWorkspaceSetupCompletion } =
    useProcessWorkspaceSetupCompletion();
  const persistedThreadId = isValidUuid(threadId) ? threadId : null;
  const lastActivityAt = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    persistedThreadId ?? '',
  )?.lastActivityAt;
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );
  const aiChatThreadIsMissing = useAtomFamilyStateValue(
    aiChatThreadIsMissingFamilyState,
    { threadId },
  );
  const aiChatThreadDisplayedMessages = useAtomFamilyStateValue(
    aiChatThreadDisplayedMessagesFamilyState,
    { threadId },
  );
  const aiChatUISessionStartTime = useAtomStateValue(
    aiChatUISessionStartTimeState,
  );
  const [isVisible, setIsVisible] = useState(isDocumentVisible);

  useListenToAiChatThreadEvents({ listenerId: instanceId, threadId });

  useEffect(() => {
    store.set(
      aiChatUISessionStartTimeState.atom,
      (sessionStartTime) => sessionStartTime ?? Temporal.Now.instant(),
    );

    const handleVisibilityChange = () => setIsVisible(isDocumentVisible());

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [store]);

  useEffect(() => {
    if (!isDefined(persistedThreadId)) {
      return;
    }

    const openViewCountAtom = aiChatThreadViewOpenCountFamilyState.atomFamily({
      threadId: persistedThreadId,
    });

    store.set(openViewCountAtom, (count) => count + 1);

    const leaveIfNoViewLeft = () => {
      if (store.get(openViewCountAtom) !== 0) {
        return;
      }

      store.set(
        aiChatThreadViewVisitFamilyState.atomFamily({
          threadId: persistedThreadId,
        }),
        null,
      );

      // Filed on leave, not on read, so the chat stays put while being read
      const thread = store.get(
        aiChatThreadRecordFamilySelector.selectorFamily(persistedThreadId),
      );
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const reopenedThreadActivity = store.get(
        aiChatReopenedThreadActivityState.atom,
      );

      if (
        isDefined(thread) &&
        isDefined(workspaceMemberId) &&
        thread.lastActivityAt !== reopenedThreadActivity[persistedThreadId] &&
        isAiChatThreadSettledForMember({
          thread,
          participant: store.get(aiChatThreadParticipantsState.atom)
            .rowsByThreadId[persistedThreadId],
          workspaceMemberId,
        })
      ) {
        void updateAgentChatThreadInboxState({
          threadIds: [persistedThreadId],
          action: AgentChatInboxAction.ARCHIVE,
        });
      }
    };

    return () => {
      store.set(openViewCountAtom, (count) => count - 1);

      if (store.get(openViewCountAtom) === 0) {
        queueMicrotask(leaveIfNoViewLeft);
      }
    };
  }, [store, persistedThreadId, updateAgentChatThreadInboxState]);

  useEffect(() => {
    if (
      !isDefined(persistedThreadId) ||
      !isVisible ||
      !aiChatThreadParticipants.isLoaded ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const participant =
      aiChatThreadParticipants.rowsByThreadId[persistedThreadId];
    const { isUnread } = getAgentChatThreadInboxStatus({
      lastActivityAt,
      participant,
    });
    const visitAtom = aiChatThreadViewVisitFamilyState.atomFamily({
      threadId: persistedThreadId,
    });
    const storedVisit = store.get(visitAtom);
    // Taken before the read mark, so it keeps where the member left off
    const newVisit: AiChatThreadVisit = {
      threadId: persistedThreadId,
      isUnread,
      lastReadAt: participant?.lastReadAt ?? null,
      isKeptUnread: false,
    };
    const visit =
      storedVisit?.threadId === persistedThreadId ? storedVisit : newVisit;

    if (visit !== storedVisit) {
      store.set(visitAtom, visit);
    }

    const isReadRequested =
      visit.readRequestedForActivityAt === lastActivityAt &&
      visit.readRequestedForParticipantUpdatedAt === participant?.updatedAt;

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
      threadIds: [persistedThreadId],
      action: AgentChatInboxAction.READ,
    });
  }, [
    isVisible,
    lastActivityAt,
    aiChatThreadParticipants,
    updateAgentChatThreadInboxState,
    store,
    persistedThreadId,
  ]);

  useEffect(() => {
    if (aiChatThreadIsMissing) {
      onThreadChange(store.get(newAiChatThreadIdState.atom));
    }
  }, [aiChatThreadIsMissing, onThreadChange, store]);

  useEffect(() => {
    if (!isDefined(aiChatUISessionStartTime)) {
      return;
    }

    for (const message of aiChatThreadDisplayedMessages) {
      const messageCreatedAt = message.metadata?.createdAt;

      if (
        !isNonEmptyString(messageCreatedAt) ||
        Temporal.Instant.from(messageCreatedAt).epochNanoseconds >=
          aiChatUISessionStartTime.epochNanoseconds
      ) {
        processWorkspaceSetupCompletion(message);
      }
    }
  }, [
    aiChatThreadDisplayedMessages,
    aiChatUISessionStartTime,
    processWorkspaceSetupCompletion,
  ]);

  return null;
};
