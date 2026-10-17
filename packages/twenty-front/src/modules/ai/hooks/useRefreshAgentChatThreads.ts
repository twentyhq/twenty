import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { AGENT_CHAT_THREAD_LIST_FILTER } from '@/ai/constants/AgentChatThreadListFilter';
import { AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS } from '@/ai/constants/AgentChatThreadListRecordGqlFields';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import {
  type AgentChatThreadList,
  agentChatThreadListState,
} from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
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
import {
  type AgentChatThreadFilterStatus,
  computeAgentChatThreadFilterStatusGqlFilter,
} from 'twenty-shared/ai';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

type AgentChatThreadsPage = {
  threads: AgentChatThreadRecord[];
  participants: AgentChatThreadParticipantFieldsFragment[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
};

const appendThreadIds = (
  threadIds: string[],
  threads: Pick<AgentChatThreadRecord, 'id'>[],
) => [
  ...threadIds,
  ...threads
    .map(({ id }) => id)
    .filter((threadId) => !threadIds.includes(threadId)),
];

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
      filter,
    }: {
      lastCursor: string | null;
      filter?: RecordGqlOperationFilter;
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
            filter: isDefined(filter)
              ? { and: [AGENT_CHAT_THREAD_LIST_FILTER, filter] }
              : AGENT_CHAT_THREAD_LIST_FILTER,
            orderBy: [{ lastActivityAt: 'DescNullsLast' }],
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
        totalCount: connection.totalCount ?? records.length,
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

  const loadAgentChatThreadsPage = useCallback(
    async ({
      getPageRequest,
      buildNextList,
    }: {
      getPageRequest: (
        list: AgentChatThreadList | null,
      ) =>
        | { lastCursor: string | null; filter?: RecordGqlOperationFilter }
        | undefined;
      buildNextList: (
        list: AgentChatThreadList | null,
        page: AgentChatThreadsPage,
      ) => AgentChatThreadList;
    }) => {
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

        const pageRequest = getPageRequest(listBeforeRequest);

        if (!isDefined(pageRequest)) {
          return undefined;
        }

        const page = await fetchAgentChatThreadsPage(pageRequest);

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

        store.set(
          agentChatThreadListState.atom,
          buildNextList(listBeforeRequest, page),
        );

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

  const loadAgentChatThreads = useCallback(
    (mode: 'refresh' | 'fetch-more') =>
      loadAgentChatThreadsPage({
        getPageRequest: (list) => {
          if (mode === 'refresh') {
            return { lastCursor: null };
          }

          return list?.hasNextPage
            ? { lastCursor: list.endCursor ?? null }
            : undefined;
        },
        buildNextList: (list, page) =>
          mode === 'refresh'
            ? {
                threadIds: page.threads.map(({ id }) => id),
                hasNextPage: page.hasNextPage,
                endCursor: page.endCursor,
              }
            : {
                ...list,
                threadIds: appendThreadIds(list?.threadIds ?? [], page.threads),
                hasNextPage: page.hasNextPage,
                endCursor: page.endCursor,
              },
      }),
    [loadAgentChatThreadsPage],
  );

  // Adds the chats of one inbox tab, which the pages of every chat may only
  // reach after many pages of chats filed long ago
  const loadAgentChatThreadsInFilterStatus = useCallback(
    (filterStatus: AgentChatThreadFilterStatus, mode: 'first' | 'next') =>
      loadAgentChatThreadsPage({
        getPageRequest: (list) => {
          const workspaceMemberId = store.get(
            currentWorkspaceMemberState.atom,
          )?.id;
          const filterStatusPage = list?.filterStatusPages?.[filterStatus];

          if (
            !isDefined(list) ||
            !isDefined(workspaceMemberId) ||
            (mode === 'next' && filterStatusPage?.hasNextPage !== true)
          ) {
            return undefined;
          }

          return {
            lastCursor:
              mode === 'next' ? (filterStatusPage?.endCursor ?? null) : null,
            filter: {
              and: [
                { deletedAt: { is: 'NULL' } },
                computeAgentChatThreadFilterStatusGqlFilter({
                  filterStatus,
                  workspaceMemberId,
                }),
              ],
            },
          };
        },
        buildNextList: (list, page) => ({
          threadIds: appendThreadIds(list?.threadIds ?? [], page.threads),
          hasNextPage: list?.hasNextPage ?? false,
          endCursor: list?.endCursor ?? null,
          filterStatusPages: {
            ...list?.filterStatusPages,
            [filterStatus]: {
              hasNextPage: page.hasNextPage,
              endCursor: page.endCursor,
              totalCount: page.totalCount,
            },
          },
        }),
      }),
    [loadAgentChatThreadsPage, store],
  );

  const refreshAgentChatThreads = useCallback(
    () => loadAgentChatThreads('refresh'),
    [loadAgentChatThreads],
  );

  const fetchMoreAgentChatThreads = useCallback(
    () => loadAgentChatThreads('fetch-more'),
    [loadAgentChatThreads],
  );

  const refreshAgentChatThreadsInFilterStatus = useCallback(
    (filterStatus: AgentChatThreadFilterStatus) =>
      loadAgentChatThreadsInFilterStatus(filterStatus, 'first'),
    [loadAgentChatThreadsInFilterStatus],
  );

  const fetchMoreAgentChatThreadsInFilterStatus = useCallback(
    (filterStatus: AgentChatThreadFilterStatus) =>
      loadAgentChatThreadsInFilterStatus(filterStatus, 'next'),
    [loadAgentChatThreadsInFilterStatus],
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
          filter: { id: { eq: threadId } },
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
    refreshAgentChatThreadsInFilterStatus,
    fetchMoreAgentChatThreadsInFilterStatus,
    loadAgentChatThread,
  };
};
