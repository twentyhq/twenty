import { useStore } from 'jotai';
import omit from 'lodash.omit';
import { isDefined } from 'twenty-shared/utils';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { agentChatPendingRecordTargetByDraftKeyState } from '@/ai/states/agentChatPendingRecordTargetByDraftKeyState';
import { movePendingRecordTargetToDraftKey } from '@/ai/utils/movePendingRecordTargetToDraftKey';

export const useAttachPendingRecordTargetOnSend = () => {
  const store = useStore();
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();

  // A failed first send restores its draft under the thread it created, so the
  // record has to move with it for the retry to find it.
  const movePendingRecordTargetToThread = ({
    draftKey,
    threadId,
  }: {
    draftKey: string;
    threadId: string;
  }) => {
    store.set(
      agentChatPendingRecordTargetByDraftKeyState.atom,
      (pendingRecordTargetByDraftKey) =>
        movePendingRecordTargetToDraftKey({
          pendingRecordTargetByDraftKey,
          fromDraftKey: draftKey,
          toDraftKey: threadId,
        }),
    );
  };

  const attachPendingRecordTargetOnSend = async ({
    threadId,
  }: {
    threadId: string;
  }) => {
    const pendingRecordTarget = store.get(
      agentChatPendingRecordTargetByDraftKeyState.atom,
    )[threadId];

    if (!isDefined(pendingRecordTarget)) {
      return;
    }

    const isAttached = await attachChatThreadToRecord({
      threadId,
      ...pendingRecordTarget,
    });

    // Kept on failure so the next message sent in the thread retries it.
    if (isAttached) {
      store.set(agentChatPendingRecordTargetByDraftKeyState.atom, (previous) =>
        omit(previous, threadId),
      );
    }
  };

  return { movePendingRecordTargetToThread, attachPendingRecordTargetOnSend };
};
