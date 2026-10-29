import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { fetchAllChatThreadLinkIds } from '@/ai/utils/fetchAllChatThreadLinkIds';
import { getChatThreadsForRecordPage } from '@/ai/utils/getChatThreadsForRecordPage';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const CHAT_THREADS_FOR_RECORD_PAGE_SIZE = 20;

const CHAT_THREAD_LINK_GQL_FIELDS = {
  id: true,
  threadId: true,
} satisfies RecordGqlFields;

const CHAT_THREADS_FOR_RECORD_GQL_FIELDS = {
  id: true,
  threadId: true,
  thread: {
    id: true,
    title: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    channelId: true,
    lastActivityAt: true,
    lastMessageText: true,
    lastMessageSenderWorkspaceMemberId: true,
    writerWorkspaceMemberIds: true,
    workspaceMemberId: true,
    pendingQuestionMessageId: true,
  },
} satisfies RecordGqlFields;

// Link events carry no conversation, so new links are read back.
const LINK_OPERATION_TYPES: ObjectRecordOperation['type'][] = [
  'create-one',
  'create-many',
];

// Title and activity changes arrive through the record cache; these change which conversations are listed.
const THREAD_OPERATION_TYPES: ObjectRecordOperation['type'][] = [
  'delete-one',
  'delete-many',
  'restore-one',
  'restore-many',
  'destroy-one',
  'destroy-many',
];

export const useChatThreadsForRecord = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  });

  const filter = useMemo(
    () =>
      isDefined(junctionConfig)
        ? getActivityTargetsFilter({
            targetableObjects: [{ id, targetObjectNameSingular }],
            activityTargetObjectMetadata: junctionConfig.junctionObjectMetadata,
            objectMetadataItems,
          })
        : undefined,
    [id, junctionConfig, objectMetadataItems, targetObjectNameSingular],
  );

  const isRecordLinkable = isNonEmptyArray(filter?.or);
  const chatObjectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) =>
      nameSingular === CoreObjectNameSingular.AgentChatThread,
  );

  const {
    records: links,
    loading,
    error,
    refetch,
    fetchMoreRecords,
    hasNextPage,
    queryIdentifier,
  } = useFindManyRecords<AgentChatThreadTargetRecord>({
    objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
    skip: !isRecordLinkable,
    filter,
    orderBy: [
      {
        thread: { lastActivityAt: 'DescNullsLast' },
      },
    ] satisfies RecordGqlOperationOrderBy,
    recordGqlFields: CHAT_THREADS_FOR_RECORD_GQL_FIELDS,
    limit: CHAT_THREADS_FOR_RECORD_PAGE_SIZE,
  });

  const { findManyRecordsQuery: findThreadLinksQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
      recordGqlFields: CHAT_THREAD_LINK_GQL_FIELDS,
    });
  const { canReadObjectRecords } = useObjectPermissionsForObject(
    junctionConfig?.junctionObjectMetadata.id ?? '',
  );

  const { threads, refetchLimit } = useMemo(
    () =>
      getChatThreadsForRecordPage({
        links,
        pageSize: CHAT_THREADS_FOR_RECORD_PAGE_SIZE,
      }),
    [links],
  );

  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    queryIdentifier,
  );

  const fetchMoreThreads = useCallback(() => {
    if (!isRecordLinkable || !hasNextPage || loading || isFetchingMoreRecords) {
      return;
    }

    return fetchMoreRecords();
  }, [
    fetchMoreRecords,
    hasNextPage,
    isFetchingMoreRecords,
    isRecordLinkable,
    loading,
  ]);

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
      variables: { filter },
    }),
    [filter],
  );

  useListenToEventsForQuery({
    queryId: `chat-threads-for-record-${targetObjectNameSingular}-${id}`,
    operationSignature,
    skip: !isRecordLinkable,
  });

  const refetchThreads = useCallback(
    () =>
      refetch({
        limit: refetchLimit,
        lastCursor: undefined,
      }),
    [refetchLimit, refetch],
  );

  const refetchLinks = useCallback(() => {
    void refetchThreads();
  }, [refetchThreads]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchLinks,
    objectMetadataItemId: junctionConfig?.junctionObjectMetadata.id,
    operationTypes: LINK_OPERATION_TYPES,
    enabled: isRecordLinkable,
  });

  const getAllLinkIdsToThread = async (threadId: string) => {
    if (
      !isRecordLinkable ||
      !canReadObjectRecords ||
      !isDefined(junctionConfig) ||
      !isDefined(filter)
    ) {
      return [];
    }

    return fetchAllChatThreadLinkIds({
      apolloCoreClient,
      query: findThreadLinksQuery,
      filter: {
        and: [
          filter,
          { [junctionConfig.sourceJoinColumnName]: { eq: threadId } },
        ],
      },
      objectNamePlural: junctionConfig.junctionObjectMetadata.namePlural,
    });
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchLinks,
    objectMetadataItemId: chatObjectMetadataItem?.id,
    operationTypes: THREAD_OPERATION_TYPES,
    enabled: isRecordLinkable && isDefined(chatObjectMetadataItem),
  });

  return {
    threads,
    getAllLinkIdsToThread,
    loading,
    error,
    refetch: refetchThreads,
    fetchMoreThreads,
    hasNextPage,
    isFetchingMoreThreads: isFetchingMoreRecords,
  };
};
