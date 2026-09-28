import { useStore } from 'jotai';
import omit from 'lodash.omit';
import { isDefined } from 'twenty-shared/utils';

import { useChatThreadRecordAttachmentActions } from '@/ai/hooks/useChatThreadRecordAttachmentActions';
import { agentChatPendingRecordTargetByDraftKeyState } from '@/ai/states/agentChatPendingRecordTargetByDraftKeyState';

export const useAttachPendingRecordTargetOnSend = () => {
  const store = useStore();
  const { attachChatThreadToRecord } = useChatThreadRecordAttachmentActions();

  // The model may attach the same record through its own tool during this
  // turn; attaching is idempotent on the server, so both can run.
  const attachPendingRecordTargetOnSend = async ({
    draftKey,
    threadId,
  }: {
    draftKey: string;
    threadId: string;
  }) => {
    const pendingRecordTargetByDraftKey = store.get(
      agentChatPendingRecordTargetByDraftKeyState.atom,
    );
    // A thread created from the draft while this send was in flight has
    // already moved the record under its own id.
    const pendingRecordTarget =
      pendingRecordTargetByDraftKey[draftKey] ??
      pendingRecordTargetByDraftKey[threadId];

    if (!isDefined(pendingRecordTarget)) {
      return;
    }

    store.set(agentChatPendingRecordTargetByDraftKeyState.atom, (previous) =>
      omit(previous, [draftKey, threadId]),
    );

    await attachChatThreadToRecord({ threadId, ...pendingRecordTarget });
  };

  return { attachPendingRecordTargetOnSend };
};
