import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS } from '@/ai/constants/AgentChatThreadListRecordGqlFields';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { buildAgentChatThreadListFilter } from '@/ai/utils/buildAgentChatThreadListFilter';
import { getAgentChatThreadLastActivityFieldName } from '@/ai/utils/getAgentChatThreadLastActivityFieldName';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const useRefreshAgentChatThreads = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThread } = useApplyAgentChatThreadUpdate();
  const { refreshAgentChatThreadParticipants } =
    useAgentChatThreadParticipants();

  const fetchAgentChatThreadsPage = useCallback(
    async ({
      lastCursor,
      threadIdFilter,
    }: {
      lastCursor: string | null;
      threadIdFilter?: RecordGqlOperationFilter;
    }) => {
      const chatObjectMetadataItem = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: CoreObjectNameSingular.AgentChatThread,
          objectNameType: 'singular',
        }),
      );

      if (
        !isDefined(chatObjectMetadataItem) ||
        chatObjectMetadataItem.readableFields.length === 0
      ) {
        return undefined;
      }

      const result = await apolloCoreClient
        .query<RecordGqlOperationFindManyResult>({
          query: generateFindManyRecordsQuery({
            objectMetadataItem: chatObjectMetadataItem,
            objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
            recordGqlFields: AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS,
            objectPermissionsByObjectMetadataId,
          }),
          variables: {
            filter: isDefined(threadIdFilter)
              ? {
                  and: [
                    buildAgentChatThreadListFilter(chatObjectMetadataItem),
                    threadIdFilter,
                  ],
                }
              : buildAgentChatThreadListFilter(chatObjectMetadataItem),
            orderBy: [
              {
                [getAgentChatThreadLastActivityFieldName(
                  chatObjectMetadataItem,
                )]: 'DescNullsLast',
              },
            ],
            limit: QUERY_MAX_RECORDS,
            lastCursor,
          },
          fetchPolicy: 'network-only',
        })
        .catch(() => undefined);

      const connection = result?.data?.[chatObjectMetadataItem.namePlural];

      if (!isDefined(connection)) {
        return undefined;
      }

      return {
        threads: getRecordsFromRecordConnection<AgentChatThreadRecord>({
          recordConnection: connection,
        }),
        hasNextPage: connection.pageInfo.hasNextPage ?? false,
        endCursor: connection.pageInfo.endCursor ?? null,
      };
    },
    [apolloCoreClient, objectPermissionsByObjectMetadataId, store],
  );

  const loadAgentChatThreads = useCallback(
    async (mode: 'refresh' | 'fetch-more') => {
      const workspaceId = store.get(currentWorkspaceState.atom)?.id;
      const userWorkspace = store.get(currentUserWorkspaceState.atom);
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const isSameSession = () =>
        store.get(currentWorkspaceState.atom)?.id === workspaceId &&
        store.get(currentWorkspaceMemberState.atom)?.id === workspaceMemberId &&
        store.get(currentUserWorkspaceState.atom) === userWorkspace;

      for (let attempt = 0; attempt < 2; attempt++) {
        const listBeforeRequest = store.get(agentChatThreadListState.atom);
        const updateCountBeforeRequest = store.get(
          agentChatThreadRecordUpdateCountState.atom,
        );
        const hasChangedSinceRequest = () =>
          store.get(agentChatThreadListState.atom) !== listBeforeRequest ||
          store.get(agentChatThreadRecordUpdateCountState.atom) !==
            updateCountBeforeRequest;

        if (mode === 'fetch-more' && !listBeforeRequest?.hasNextPage) {
          return undefined;
        }

        const page = await fetchAgentChatThreadsPage({
          lastCursor:
            mode === 'fetch-more'
              ? (listBeforeRequest?.endCursor ?? null)
              : null,
        });

        if (!isDefined(page) || !isSameSession()) {
          return undefined;
        }

        // Retry rather than overwrite a record event applied mid-request.
        if (hasChangedSinceRequest()) {
          continue;
        }

        const selectedThreadId = store.get(currentAiChatThreadState.atom);
        await refreshAgentChatThreadPermissions([
          ...page.threads.map(({ id }) => id),
          ...(isDefined(selectedThreadId) && isValidUuid(selectedThreadId)
            ? [selectedThreadId]
            : []),
        ]);

        if (!isSameSession() || hasChangedSinceRequest()) {
          continue;
        }

        upsertRecordsInStore({ partialRecords: page.threads });

        const pageThreadIds = page.threads.map(({ id }) => id);
        const previousThreadIds =
          mode === 'fetch-more' ? (listBeforeRequest?.threadIds ?? []) : [];

        store.set(agentChatThreadListState.atom, {
          threadIds: [
            ...previousThreadIds,
            ...pageThreadIds.filter(
              (threadId) => !previousThreadIds.includes(threadId),
            ),
          ],
          hasNextPage: page.hasNextPage,
          endCursor: page.endCursor,
        });

        return page.threads;
      }

      return undefined;
    },
    [
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  const refreshAgentChatThreads = useCallback(async () => {
    const [threads] = await Promise.all([
      loadAgentChatThreads('refresh'),
      refreshAgentChatThreadParticipants(),
    ]);

    return threads;
  }, [loadAgentChatThreads, refreshAgentChatThreadParticipants]);

  const fetchMoreAgentChatThreads = useCallback(
    () => loadAgentChatThreads('fetch-more'),
    [loadAgentChatThreads],
  );

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadAgentChatThread = useCallback(
    async (threadId: string) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const updateCountBeforeRequest = store.get(
          agentChatThreadRecordUpdateCountState.atom,
        );
        const page = await fetchAgentChatThreadsPage({
          lastCursor: null,
          threadIdFilter: { id: { eq: threadId } },
        });

        if (!isDefined(page)) {
          return undefined;
        }

        const thread = page.threads[0];

        if (!isDefined(thread)) {
          return null;
        }

        await refreshAgentChatThreadPermissions([thread.id]);

        if (
          store.get(agentChatThreadRecordUpdateCountState.atom) !==
          updateCountBeforeRequest
        ) {
          continue;
        }

        addAgentChatThread(thread);

        // The chat may have been selected before its record loaded, when usage couldn't be restored.
        const usageAtom = agentChatUsageComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId: thread.id },
        });

        if (!isDefined(store.get(usageAtom))) {
          store.set(usageAtom, getAgentChatUsageFromThread(thread));
        }

        return thread;
      }

      return undefined;
    },
    [
      addAgentChatThread,
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
    ],
  );

  return {
    refreshAgentChatThreads,
    fetchMoreAgentChatThreads,
    loadAgentChatThread,
  };
};
