import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { AGENT_CHAT_THREAD_LIST_FILTER } from '@/ai/constants/AgentChatThreadListFilter';
import { AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS } from '@/ai/constants/AgentChatThreadListRecordGqlFields';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityFieldName } from '@/ai/utils/getAgentChatThreadLastActivityFieldName';
import { getAgentChatThreadParticipantFromRecord } from '@/ai/utils/getAgentChatThreadParticipantFromRecord';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const useRefreshAgentChatThreads = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThread } = useApplyAgentChatThreadUpdate();

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

      const currentWorkspaceMemberId = store.get(
        currentWorkspaceMemberState.atom,
      )?.id;

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
              ? { and: [AGENT_CHAT_THREAD_LIST_FILTER, threadIdFilter] }
              : AGENT_CHAT_THREAD_LIST_FILTER,
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

      const records = getRecordsFromRecordConnection<
        AgentChatThreadRecord & { participants?: ObjectRecord[] }
      >({ recordConnection: connection });

      return {
        threads: records.map(
          ({ participants: _participants, ...thread }) => thread,
        ),
        // Roles that read every record get every member's row
        participants: records
          .flatMap(({ participants }) => participants ?? [])
          .filter(
            (participant) =>
              participant.workspaceMemberId === currentWorkspaceMemberId,
          )
          .map(getAgentChatThreadParticipantFromRecord),
        hasNextPage: connection.pageInfo.hasNextPage ?? false,
        endCursor: connection.pageInfo.endCursor ?? null,
      };
    },
    [apolloCoreClient, objectPermissionsByObjectMetadataId, store],
  );

  // The member's inbox state comes with the threads it belongs to
  const addAgentChatThreadParticipants = useCallback(
    (participants: AgentChatThreadParticipantFieldsFragment[]) => {
      store.set(agentChatThreadParticipantsState.atom, (loadedParticipants) =>
        mergeAgentChatThreadParticipants(
          mergeAgentChatThreadParticipants(
            loadedParticipants ?? {},
            participants,
          ),
          Object.values(
            store.get(agentChatThreadStreamedParticipantsState.atom),
          ),
        ),
      );
    },
    [store],
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
        addAgentChatThreadParticipants(page.participants);

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
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  const refreshAgentChatThreads = useCallback(
    () => loadAgentChatThreads('refresh'),
    [loadAgentChatThreads],
  );

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
        addAgentChatThreadParticipants(page.participants);

        // The chat may have been selected before its record loaded, when usage couldn't be restored.
        const usageAtom = agentChatUsageFamilyState.atomFamily({
          threadId: thread.id,
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
      addAgentChatThreadParticipants,
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
