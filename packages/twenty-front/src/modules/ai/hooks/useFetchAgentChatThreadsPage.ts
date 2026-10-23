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
      };
    },
    [apolloCoreClient, objectPermissionsByObjectMetadataId, store],
  );

  return { fetchAgentChatThreadsPage };
};
