import { useStore } from 'jotai';
import { useCallback } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  StandardObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  canReachSomeRecords,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AGENT_CHAT_THREAD_LIST_FILTER } from '@/ai/constants/AgentChatThreadListFilter';
import { AGENT_CHAT_THREAD_LIST_RECORD_GQL_FIELDS } from '@/ai/constants/AgentChatThreadListRecordGqlFields';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadParticipantFromRecord } from '@/ai/utils/getAgentChatThreadParticipantFromRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

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
      const hasAiPermission = store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI
      ];
      const isWorkspaceSuspended =
        store.get(currentWorkspaceState.atom)?.activationStatus ===
        WorkspaceActivationStatus.SUSPENDED;

      if (!hasAiPermission || isWorkspaceSuspended) {
        return undefined;
      }

      const chatObjectMetadataItem = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: StandardObjectNameSingular.AgentChatThread,
          objectNameType: 'singular',
        }),
      );

      if (
        !isDefined(chatObjectMetadataItem) ||
        !isNonEmptyArray(chatObjectMetadataItem.readableFields)
      ) {
        return undefined;
      }

      const hasReadPermission = canReachSomeRecords({
        objectRecordsPermissions: getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          chatObjectMetadataItem.id,
        ),
        operationType: 'read',
      });

      if (!hasReadPermission) {
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
        .catch((error) => {
          logError(error);

          return undefined;
        });

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
