import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

import {
  InboxItemPlanContext,
  type InboxItemToolCallDraft,
} from '@/inbox/contexts/InboxItemPlanContext';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useInboxItemMessageThreadId } from '@/inbox/hooks/useInboxItemMessageThreadId';
import { getFeaturedInboxToolCall } from '@/inbox/utils/getFeaturedInboxToolCall';
import {
  type InboxItem,
  InboxItemScope,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

type InboxItemPlanProviderProps = {
  inboxItem: InboxItem;
  // Called once a run leaves the item done, so the list can move on the way
  // a mail client does after send.
  onItemCompleted?: () => void;
  children: ReactNode;
};

// The one controller for an item's plan. The slots and the footer read from
// it and never from each other, which is what lets the frame be drawn once
// whatever the item is about.
export const InboxItemPlanProvider = ({
  inboxItem,
  onItemCompleted,
  children,
}: InboxItemPlanProviderProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const {
    transitionInboxItem,
    reopenInboxItem,
    runInboxItemToolCalls,
    runInboxItemToolCall,
    createInboxItemToolCall,
    updateInboxItemToolCallInput,
    setInboxItemToolCallRejected,
  } = useInboxItemActions();
  const messageThreadId = useInboxItemMessageThreadId(inboxItem);

  const isArchived = inboxItem.scope === InboxItemScope.ARCHIVED;
  const toolCalls = inboxItem.toolCalls;
  // An archived item has nothing left to run, so nothing takes the body:
  // every call reads as a row of what happened.
  const featuredToolCall = isArchived
    ? null
    : getFeaturedInboxToolCall(toolCalls);
  const otherToolCalls = toolCalls.filter(
    (toolCall) => toolCall.id !== featuredToolCall?.id,
  );
  const countPending = (calls: typeof toolCalls) =>
    calls.filter(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
    ).length;

  const [isRunning, setIsRunning] = useState(false);
  const [inFlightEditCount, setInFlightEditCount] = useState(0);
  const [failedSaveToolCallIds, setFailedSaveToolCallIds] = useState<string[]>(
    [],
  );

  const reportFailure = () =>
    enqueueToast({ variant: 'error', children: t`That could not be applied` });

  // A blur save or a skip still on the wire must land before the item is done,
  // or the run could use the input from before the edit. A save that failed
  // keeps the run blocked until that call saves again, since its editor still
  // shows what the server never got. Resolves to whether the write landed, so
  // a run that flushed it can stop without waiting for the state to render.
  const trackEdit = async (
    edit: () => Promise<unknown>,
    inputSaveToolCallId?: string,
  ): Promise<boolean> => {
    setInFlightEditCount((count) => count + 1);

    try {
      await edit();

      if (isDefined(inputSaveToolCallId)) {
        setFailedSaveToolCallIds((current) =>
          current.filter((id) => id !== inputSaveToolCallId),
        );
      }

      return true;
    } catch {
      if (isDefined(inputSaveToolCallId)) {
        setFailedSaveToolCallIds((current) =>
          current.includes(inputSaveToolCallId)
            ? current
            : [...current, inputSaveToolCallId],
        );
      }

      reportFailure();

      return false;
    } finally {
      setInFlightEditCount((count) => count - 1);
    }
  };

  // Editors that save on a delay register how to land what is still pending,
  // so a run never reads a row the person had already moved past. A stable
  // container rather than state: nothing renders from it.
  const [pendingFlushes] = useState(
    () => new Map<string, () => Promise<boolean>>(),
  );

  const registerFlush = (
    toolCallId: string,
    flush: (() => Promise<boolean>) | null,
  ) => {
    if (isDefined(flush)) {
      pendingFlushes.set(toolCallId, flush);
    } else {
      pendingFlushes.delete(toolCallId);
    }
  };

  const flushPendingEdits = async () => {
    const landed = await Promise.all(
      [...pendingFlushes.values()].map((flush) => flush()),
    );

    return landed.every(Boolean);
  };

  const runGuarded = async (run: () => Promise<InboxItem | undefined>) => {
    setIsRunning(true);

    try {
      // A save that failed on the way in has already been reported, and the
      // row still holds the input from before the edit: running now would
      // send that.
      if (!(await flushPendingEdits())) {
        return;
      }

      const inboxItemAfterRun = await run();

      if (inboxItemAfterRun?.scope === InboxItemScope.ARCHIVED) {
        onItemCompleted?.();
      }
    } catch {
      reportFailure();
    } finally {
      setIsRunning(false);
    }
  };

  const runAll = () =>
    runGuarded(() =>
      runInboxItemToolCalls({
        inboxItemId: inboxItem.id,
        expectedVersion: inboxItem.version,
      }),
    );

  const runToolCall = (toolCallId: string) =>
    runGuarded(() =>
      runInboxItemToolCall({
        inboxItemToolCallId: toolCallId,
        expectedVersion: inboxItem.version,
      }),
    );

  // A call the person adds themselves lands as proposed, like an agent's: the
  // row is the draft, and it is featured or listed by the same rule.
  const createToolCall = (draft: InboxItemToolCallDraft) =>
    trackEdit(() =>
      createInboxItemToolCall({ inboxItemId: inboxItem.id, ...draft }),
    );

  const saveToolCallInput = (
    toolCallId: string,
    editedInput: Record<string, unknown>,
  ) =>
    trackEdit(
      () =>
        updateInboxItemToolCallInput({
          inboxItemToolCallId: toolCallId,
          editedInput,
        }),
      toolCallId,
    );

  const setToolCallRejected = (toolCallId: string, isRejected: boolean) =>
    trackEdit(() =>
      setInboxItemToolCallRejected({
        inboxItemToolCallId: toolCallId,
        isRejected,
      }),
    );

  // Putting an item away moves the list on, the same as finishing its plan.
  const archiveItem = () =>
    void transitionInboxItem({
      inboxItemId: inboxItem.id,
      transition: { kind: 'CLEAR' },
      expectedVersion: inboxItem.version,
    })
      .then(() => onItemCompleted?.())
      .catch(reportFailure);

  const reopenItem = () =>
    void reopenInboxItem({
      inboxItemId: inboxItem.id,
      expectedVersion: inboxItem.version,
    }).catch(reportFailure);

  return (
    <InboxItemPlanContext.Provider
      value={{
        inboxItem,
        messageThreadId,
        isArchived,
        isBusy:
          isRunning ||
          inFlightEditCount > 0 ||
          failedSaveToolCallIds.length > 0,
        featuredToolCall,
        otherToolCalls,
        pendingToolCallCount: countPending(toolCalls),
        otherPendingToolCallCount: countPending(otherToolCalls),
        runAll,
        runToolCall,
        createToolCall,
        saveToolCallInput,
        setToolCallRejected,
        registerFlush,
        archiveItem,
        reopenItem,
      }}
    >
      {children}
    </InboxItemPlanContext.Provider>
  );
};
