import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type AgentChatThreadPreviewEntry,
  agentChatThreadPreviewsState,
} from '@/ai/states/agentChatThreadPreviewsState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { GetAgentChatThreadPreviewsDocument } from '~/generated-metadata/graphql';

type AgentChatThreadPreviewsEffectProps = {
  threads: Pick<AgentChatThreadRecord, 'id' | 'lastActivityAt'>[];
};

export const AgentChatThreadPreviewsEffect = ({
  threads,
}: AgentChatThreadPreviewsEffectProps) => {
  const client = useApolloClient();
  const store = useStore();

  useEffect(() => {
    const previews = store.get(agentChatThreadPreviewsState.atom);
    const staleThreads = threads.filter(
      ({ id, lastActivityAt }) =>
        !isDefined(previews[id]) ||
        previews[id].lastActivityAt !== (lastActivityAt ?? null),
    );

    if (staleThreads.length === 0) {
      return;
    }

    // Recorded before the request, so a re-render does not ask again
    store.set(agentChatThreadPreviewsState.atom, (currentPreviews) => ({
      ...currentPreviews,
      ...Object.fromEntries(
        staleThreads.map(({ id, lastActivityAt }) => [
          id,
          {
            lastActivityAt: lastActivityAt ?? null,
            preview: currentPreviews[id]?.preview ?? null,
          },
        ]),
      ),
    }));

    const requestedLastActivityAts = new Map(
      staleThreads.map(({ id, lastActivityAt }) => [
        id,
        lastActivityAt ?? null,
      ]),
    );
    const isRequestCurrent = (
      threadId: string,
      entry: AgentChatThreadPreviewEntry | undefined,
    ) =>
      requestedLastActivityAts.has(threadId) &&
      entry?.lastActivityAt === requestedLastActivityAts.get(threadId);

    void client
      .query({
        query: GetAgentChatThreadPreviewsDocument,
        variables: { threadIds: staleThreads.map(({ id }) => id) },
        fetchPolicy: 'network-only',
      })
      .then((result) => {
        const fetchedPreviews = result.data?.agentChatThreadPreviews ?? [];

        store.set(agentChatThreadPreviewsState.atom, (currentPreviews) => ({
          ...currentPreviews,
          ...Object.fromEntries(
            fetchedPreviews
              .filter((preview) =>
                isRequestCurrent(
                  preview.threadId,
                  currentPreviews[preview.threadId],
                ),
              )
              .map((preview) => [
                preview.threadId,
                {
                  lastActivityAt: requestedLastActivityAts.get(
                    preview.threadId,
                  ),
                  preview,
                },
              ]),
          ),
        }));
      })
      .catch(() => {
        store.set(agentChatThreadPreviewsState.atom, (currentPreviews) => ({
          ...currentPreviews,
          ...Object.fromEntries(
            [...requestedLastActivityAts.keys()]
              .filter((threadId) =>
                isRequestCurrent(threadId, currentPreviews[threadId]),
              )
              .map((threadId) => [
                threadId,
                { preview: currentPreviews[threadId].preview },
              ]),
          ),
        }));
      });
  }, [client, store, threads]);

  return null;
};
