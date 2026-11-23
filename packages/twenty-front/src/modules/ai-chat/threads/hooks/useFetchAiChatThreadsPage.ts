import { useStore } from 'jotai';
import { useCallback } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AI_CHAT_THREADS_FILTER } from '@/ai-chat/threads/constants/AiChatThreadsFilter';
import { AI_CHAT_THREAD_RECORD_GQL_FIELDS } from '@/ai-chat/threads/constants/AiChatThreadRecordGqlFields';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getAiChatThreadParticipantFromRecord } from '@/ai-chat/threads/utils/getAiChatThreadParticipantFromRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { aiChatThreadObjectMetadataItemSelector } from '@/ai-chat/threads/states/selectors/aiChatThreadObjectMetadataItemSelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useFetchAiChatThreadsPage = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();

  const fetchAiChatThreadsPage = useCallback(
    async ({
      lastCursor,
      threadIdFilter,
    }: {
      lastCursor: string | null;
      threadIdFilter?: RecordGqlOperationFilter;
    }) => {
      const objectPermissionsByObjectMetadataId = store.get(
        objectPermissionsByObjectMetadataIdSelector.atom,
      );
      const hasAiPermission = store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI
      ];
      const isWorkspaceSuspended =
        store.get(currentWorkspaceState.atom)?.activationStatus ===
        WorkspaceActivationStatus.SUSPENDED;

      if (!hasAiPermission || isWorkspaceSuspended) {
        return undefined;
      }

      const aiChatThreadObjectMetadataItem = store.get(
        aiChatThreadObjectMetadataItemSelector.atom,
      );

      if (
        !isDefined(aiChatThreadObjectMetadataItem) ||
        !isNonEmptyArray(aiChatThreadObjectMetadataItem.readableFields)
      ) {
        return undefined;
      }

      const hasReadPermission = canAccessThroughAllRecordsOrRlsPermission({
        objectRecordsPermissions: getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          aiChatThreadObjectMetadataItem.id,
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
            objectMetadataItem: aiChatThreadObjectMetadataItem,
            objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
            recordGqlFields: AI_CHAT_THREAD_RECORD_GQL_FIELDS,
            objectPermissionsByObjectMetadataId,
          }),
          variables: {
            filter: isDefined(threadIdFilter)
              ? { and: [AI_CHAT_THREADS_FILTER, threadIdFilter] }
              : AI_CHAT_THREADS_FILTER,
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

      const connection =
        result?.data?.[aiChatThreadObjectMetadataItem.namePlural];

      if (!isDefined(connection)) {
        return undefined;
      }

      const records = getRecordsFromRecordConnection<
        AiChatThreadRecord & { participants?: ObjectRecord[] }
      >({ recordConnection: connection });

      return {
        threads: records.map(
          ({ participants: _participants, ...thread }) => thread,
        ),
        participants: records
          .flatMap(({ participants }) => participants ?? [])
          .filter(
            (participant) =>
              participant.workspaceMemberId === currentWorkspaceMemberId,
          )
          .map(getAiChatThreadParticipantFromRecord),
        hasNextPage: connection.pageInfo.hasNextPage ?? false,
        endCursor: connection.pageInfo.endCursor ?? null,
      };
    },
    [apolloCoreClient, store],
  );

  return { fetchAiChatThreadsPage };
};
