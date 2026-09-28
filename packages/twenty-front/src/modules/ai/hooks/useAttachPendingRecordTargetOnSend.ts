import { useStore } from 'jotai';
import omit from 'lodash.omit';
import { isDefined } from 'twenty-shared/utils';

import { useChatThreadRecordAttachmentActions } from '@/ai/hooks/useChatThreadRecordAttachmentActions';
import { agentChatPendingRecordTargetByDraftKeyState } from '@/ai/states/agentChatPendingRecordTargetByDraftKeyState';

export const useAttachPendingRecordTargetOnSend = () => {
  const store = useStore();
  const { attachChatThreadToRecord } = useChatThreadRecordAttachmentActions();

  // A failed first send restores its draft under the thread it created, so the
  // record has to move with it for the retry to find it.
  const movePendingRecordTargetToThread = ({
    draftKey,
    threadId,
  }: {
    draftKey: string;
    threadId: string;
  }) => {
    if (draftKey === threadId) {
      return;
    }

    store.set(
      agentChatPendingRecordTargetByDraftKeyState.atom,
      ({ [draftKey]: pendingRecordTarget, ...otherRecordTargets }) =>
        isDefined(pendingRecordTarget)
          ? { ...otherRecordTargets, [threadId]: pendingRecordTarget }
          : otherRecordTargets,
    );
  };

  // The model may attach the same record through its own tool during this
  // turn; attaching is idempotent on the server, so both can run.
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
