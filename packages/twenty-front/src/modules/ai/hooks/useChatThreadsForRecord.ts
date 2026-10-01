import uniqBy from 'lodash.uniqby';
import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { getAgentChatThreadLastActivityFieldName } from '@/ai/utils/getAgentChatThreadLastActivityFieldName';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';

// A card of recent conversations, never paged further.
const CHAT_THREADS_FOR_RECORD_PAGE_SIZE = 20;

const CHAT_THREADS_FOR_RECORD_GQL_FIELDS = {
  id: true,
  threadId: true,
  thread: {
    id: true,
    title: true,
    deletedAt: true,
    updatedAt: true,
    lastActivityAt: true,
  },
};

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

  const {
    records: links,
    loading,
    error,
    refetch,
  } = useFindManyRecords<AgentChatThreadTargetRecord>({
    objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
    skip: !isRecordLinkable,
    filter,
    orderBy: [
      {
        thread: {
          [getAgentChatThreadLastActivityFieldName(
            objectMetadataItems.find(
              ({ nameSingular }) =>
                nameSingular === CoreObjectNameSingular.AgentChatThread,
            ),
          )]: 'DescNullsLast',
        },
      },
    ] satisfies RecordGqlOperationOrderBy,
    recordGqlFields: CHAT_THREADS_FOR_RECORD_GQL_FIELDS,
    limit: CHAT_THREADS_FOR_RECORD_PAGE_SIZE,
  });

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

  const refetchLinks = useCallback(() => {
    void refetch();
  }, [refetch]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchLinks,
    objectMetadataItemId: junctionConfig?.junctionObjectMetadata.id,
    operationTypes: LINK_OPERATION_TYPES,
    enabled: isRecordLinkable,
  });

  // Custom legs allow duplicate links; sorted since an update doesn't reorder the fetched page.
  const threads = sortChatThreadsByLastActivityDesc(
    uniqBy(links.map(({ thread }) => thread).filter(isDefined), 'id'),
  );

  const getLinkIdsToThread = (threadId: string) =>
    links.filter((link) => link.threadId === threadId).map(({ id }) => id);

  const chatObjectMetadataItemId = objectMetadataItems.find(
    ({ nameSingular }) =>
      nameSingular === CoreObjectNameSingular.AgentChatThread,
  )?.id;

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: refetchLinks,
    objectMetadataItemId: chatObjectMetadataItemId,
    operationTypes: THREAD_OPERATION_TYPES,
    enabled: isRecordLinkable && isDefined(chatObjectMetadataItemId),
  });

  return { threads, getLinkIdsToThread, loading, error, refetch };
};
