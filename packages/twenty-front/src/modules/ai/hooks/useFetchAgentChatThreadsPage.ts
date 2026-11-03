import { useStore } from 'jotai';
import { useCallback } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_LIST_FILTER } from '@/ai/constants/AgentChatThreadListFilter';
import { AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS } from '@/ai/constants/AgentChatThreadListRecordGqlFields';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';
import { getAgentChatThreadParticipantFromRecord } from '@/ai/utils/getAgentChatThreadParticipantFromRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

export const useFetchAgentChatThreadsPage = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const fetchAgentChatThreadsPage = useCallback(
    async ({
      lastCursor,
      threadIdFilter,
      isSnoozed = false,
    }: {
      lastCursor: string | null;
      threadIdFilter?: RecordGqlOperationFilter;
      isSnoozed?: boolean;
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

      let participantCursor = lastCursor;

      while (true) {
        let snoozedPage:
          | {
              participants: ObjectRecord[];
              hasNextPage: boolean;
              endCursor: string | null;
            }
          | undefined;

        if (isSnoozed) {
          const participantObjectMetadataItem = store.get(
            objectMetadataItemFamilySelector.selectorFamily({
              objectName: CoreObjectNameSingular.AgentChatThreadParticipant,
              objectNameType: 'singular',
            }),
          );

          if (
            !isDefined(participantObjectMetadataItem) ||
            !isDefined(currentWorkspaceMemberId)
          ) {
            return undefined;
          }

          const result = await apolloCoreClient
            .query<RecordGqlOperationFindManyResult>({
              query: generateFindManyRecordsQuery({
                objectMetadataItem: participantObjectMetadataItem,
                objectMetadataItems: store.get(
                  objectMetadataItemsSelector.atom,
                ),
                recordGqlFields:
                  AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS.participants,
                objectPermissionsByObjectMetadataId,
              }),
              variables: {
                filter: {
                  workspaceMemberId: { eq: currentWorkspaceMemberId },
                  isSubscribed: { eq: true },
                  archivedAt: { is: 'NOT_NULL' },
                  snoozedUntil: { is: 'NOT_NULL' },
                },
                orderBy: [
                  { snoozedUntil: 'AscNullsLast' },
                  { threadId: 'DescNullsLast' },
                ],
                limit: QUERY_MAX_RECORDS,
                lastCursor: participantCursor,
              },
              fetchPolicy: 'network-only',
            })
            .catch(() => undefined);
          const connection =
            result?.data?.[participantObjectMetadataItem.namePlural];

          if (!isDefined(connection)) {
            return undefined;
          }

          snoozedPage = {
            participants: getRecordsFromRecordConnection<ObjectRecord>({
              recordConnection: connection,
            }),
            hasNextPage: connection.pageInfo.hasNextPage ?? false,
            endCursor: connection.pageInfo.endCursor ?? null,
          };
        }

        const pageThreadIdFilter = isDefined(snoozedPage)
          ? {
              id: {
                in: snoozedPage.participants.map(
                  (participant) => participant.threadId,
                ),
              },
            }
          : threadIdFilter;
        const result = await apolloCoreClient
          .query<RecordGqlOperationFindManyResult>({
            query: generateFindManyRecordsQuery({
              objectMetadataItem: chatObjectMetadataItem,
              objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
              recordGqlFields: AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS,
              objectPermissionsByObjectMetadataId,
            }),
            variables: {
              filter: isDefined(pageThreadIdFilter)
                ? { and: [AGENT_CHAT_THREAD_LIST_FILTER, pageThreadIdFilter] }
                : AGENT_CHAT_THREAD_LIST_FILTER,
              orderBy: [{ lastActivityAt: 'DescNullsLast' }],
              limit: QUERY_MAX_RECORDS,
              lastCursor: isSnoozed ? null : lastCursor,
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
        const loadedThreads = records.map(
          ({ participants: _participants, ...thread }) => thread,
        );
        const threadsById = new Map(
          loadedThreads.map((thread) => [thread.id, thread]),
        );
        const threads = isDefined(snoozedPage)
          ? snoozedPage.participants
              .map((participant) => threadsById.get(participant.threadId))
              .filter(isDefined)
          : loadedThreads;
        const participants = [
          ...(snoozedPage?.participants ?? []),
          ...records.flatMap(({ participants }) => participants ?? []),
        ]
          .filter(
            (participant) =>
              participant.workspaceMemberId === currentWorkspaceMemberId,
          )
          .map(getAgentChatThreadParticipantFromRecord);
        const participantsByThreadId = mergeAgentChatThreadParticipants(
          {},
          participants,
        );
        const hasVisibleSnoozedThread = threads.some((thread) => {
          const participant = participantsByThreadId[thread.id];

          return (
            !isDefined(thread.deletedAt) &&
            participant?.isSubscribed === true &&
            isDefined(participant.archivedAt) &&
            isDefined(participant.snoozedUntil)
          );
        });

        if (
          isDefined(snoozedPage) &&
          !hasVisibleSnoozedThread &&
          snoozedPage.hasNextPage
        ) {
          if (
            !isDefined(snoozedPage.endCursor) ||
            snoozedPage.endCursor === participantCursor
          ) {
            return undefined;
          }

          participantCursor = snoozedPage.endCursor;
          continue;
        }

        return {
          threads,
          participants,
          hasNextPage:
            snoozedPage?.hasNextPage ??
            connection.pageInfo.hasNextPage ??
            false,
          endCursor: isDefined(snoozedPage)
            ? snoozedPage.endCursor
            : (connection.pageInfo.endCursor ?? null),
          lastLoadedSortAt:
            snoozedPage?.participants.at(-1)?.snoozedUntil ?? null,
          lastLoadedThreadId:
            snoozedPage?.participants.at(-1)?.threadId ?? null,
        };
      }
    },
    [apolloCoreClient, objectPermissionsByObjectMetadataId, store],
  );

  return { fetchAgentChatThreadsPage };
};
