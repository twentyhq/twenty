import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import chunk from 'lodash.chunk';
import { useCallback } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { GET_AGENT_CHAT_THREAD_ROW_METADATA } from '@/ai/graphql/queries/getAgentChatThreadRowMetadata';
import { agentChatThreadRowMetadataFamilyState } from '@/ai/states/agentChatThreadRowMetadataFamilyState';
import { agentChatThreadRowMetadataRequestFamilyState } from '@/ai/states/agentChatThreadRowMetadataRequestFamilyState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useRefreshAgentChatThreadRowMetadata = () => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const refreshAgentChatThreadRowMetadata = useCallback(
    async ({
      threads,
      isCurrentRequest = () => true,
    }: {
      threads: AgentChatThreadRecord[];
      isCurrentRequest?: () => boolean;
    }) => {
      if (!isNonEmptyArray(threads)) {
        return;
      }

      const workspace = store.get(currentWorkspaceState.atom);
      const workspaceMember = store.get(currentWorkspaceMemberState.atom);

      if (!isDefined(workspace) || !isDefined(workspaceMember)) {
        return;
      }

      const requestByThreadId = new Map<string, number>();

      for (const { id } of threads) {
        const requestAtom =
          agentChatThreadRowMetadataRequestFamilyState.atomFamily(id);
        const request = store.get(requestAtom) + 1;
        store.set(requestAtom, request);
        requestByThreadId.set(id, request);
      }

      for (const threadBatch of chunk(threads, QUERY_MAX_RECORDS)) {
        const result = await apolloClient
          .query({
            query: GET_AGENT_CHAT_THREAD_ROW_METADATA,
            variables: { threadIds: threadBatch.map(({ id }) => id) },
            fetchPolicy: 'network-only',
          })
          .catch(() => undefined);

        const isSameSession =
          store.get(currentWorkspaceState.atom) === workspace &&
          store.get(currentWorkspaceMemberState.atom) === workspaceMember;

        if (!isCurrentRequest() || !isSameSession) {
          return;
        }

        const metadataByThreadId = new Map(
          result?.data?.agentChatThreadRowMetadata.map((metadata) => [
            metadata.threadId,
            metadata,
          ]) ?? [],
        );

        for (const { id } of threadBatch) {
          if (
            store.get(
              agentChatThreadRowMetadataRequestFamilyState.atomFamily(id),
            ) !== requestByThreadId.get(id)
          ) {
            continue;
          }

          store.set(
            agentChatThreadRowMetadataFamilyState.atomFamily(id),
            metadataByThreadId.get(id) ?? null,
          );
        }
      }
    },
    [apolloClient, store],
  );

  return { refreshAgentChatThreadRowMetadata };
};
