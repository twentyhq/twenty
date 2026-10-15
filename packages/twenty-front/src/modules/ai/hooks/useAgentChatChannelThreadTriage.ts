import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  MarkAgentChatThreadAsDoneInChannelDocument,
  ReopenAgentChatThreadInChannelDocument,
  SnoozeAgentChatThreadInChannelDocument,
} from '~/generated-metadata/graphql';

type AgentChatThreadChannelCopy = Pick<
  AgentChatThreadRecord,
  'channelArchivedAt' | 'channelSnoozedUntil'
>;

// Files a chat for its whole channel. The change shows right away, and is put
// back if the server refuses it
export const useAgentChatChannelThreadTriage = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();

  const updateChannelCopy = useCallback(
    async <TVariables extends { threadId: string }>({
      mutation,
      variables,
      optimisticChannelCopy,
    }: {
      mutation: TypedDocumentNode<unknown, TVariables>;
      variables: TVariables;
      optimisticChannelCopy: AgentChatThreadChannelCopy;
    }) => {
      const { threadId } = variables;
      const getThread = () =>
        store.get(agentChatThreadRecordFamilySelector.selectorFamily(threadId));
      const previousThread = getThread();

      if (!isDefined(previousThread)) {
        return;
      }

      applyAgentChatThreadUpdate({ id: threadId, ...optimisticChannelCopy });

      try {
        await client.mutate({ mutation, variables });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        // A newer copy may have arrived since, and is kept
        const currentThread = getThread();

        if (
          currentThread?.channelArchivedAt ===
            optimisticChannelCopy.channelArchivedAt &&
          currentThread?.channelSnoozedUntil ===
            optimisticChannelCopy.channelSnoozedUntil
        ) {
          applyAgentChatThreadUpdate({
            id: threadId,
            channelArchivedAt: previousThread.channelArchivedAt ?? null,
            channelSnoozedUntil: previousThread.channelSnoozedUntil ?? null,
          });
        }
      }
    },
    [applyAgentChatThreadUpdate, client, enqueueToast, store],
  );

  const markAgentChatThreadAsDoneInChannel = useCallback(
    (threadId: string) =>
      updateChannelCopy({
        mutation: MarkAgentChatThreadAsDoneInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: new Date().toISOString(),
          channelSnoozedUntil: null,
        },
      }),
    [updateChannelCopy],
  );

  const reopenAgentChatThreadInChannel = useCallback(
    (threadId: string) =>
      updateChannelCopy({
        mutation: ReopenAgentChatThreadInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: null,
          channelSnoozedUntil: null,
        },
      }),
    [updateChannelCopy],
  );

  const snoozeAgentChatThreadsInChannel = useCallback(
    async ({
      threadIds,
      snoozedUntil,
    }: {
      threadIds: string[];
      snoozedUntil: Date;
    }) => {
      await Promise.all(
        threadIds.map((threadId) =>
          updateChannelCopy({
            mutation: SnoozeAgentChatThreadInChannelDocument,
            variables: { threadId, snoozedUntil: snoozedUntil.toISOString() },
            optimisticChannelCopy: {
              channelArchivedAt: new Date().toISOString(),
              channelSnoozedUntil: snoozedUntil.toISOString(),
            },
          }),
        ),
      );
    },
    [updateChannelCopy],
  );

  return {
    markAgentChatThreadAsDoneInChannel,
    reopenAgentChatThreadInChannel,
    snoozeAgentChatThreadsInChannel,
  };
};
