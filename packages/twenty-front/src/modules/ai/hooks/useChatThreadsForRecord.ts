import uniqBy from 'lodash.uniqby';
import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';

// The widget shows the most recent conversations in a card rather than a
// browsable list, so it asks for one page and never pages further.
const CHAT_THREADS_FOR_RECORD_PAGE_SIZE = 20;

// Every turn updates its thread, so this ranks by the latest activity.
const CHAT_THREADS_FOR_RECORD_ORDER_BY: RecordGqlOperationOrderBy = [
  { thread: { updatedAt: 'DescNullsLast' } },
];

const CHAT_THREADS_FOR_RECORD_GQL_FIELDS = {
  id: true,
  threadId: true,
  thread: { id: true, title: true, archivedAt: true, updatedAt: true },
};

// A link's record event carries its columns but not its conversation, so a
// new link is read back rather than taken from the event.
const LINK_OPERATION_TYPES: ObjectRecordOperation['type'][] = [
  'create-one',
  'create-many',
];

const THREAD_OPERATION_TYPES: MetadataOperation<FlatAgentChatThread>['type'][] =
  ['update', 'delete'];

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

  const {
    records: links,
    loading,
    error,
    refetch,
  } = useFindManyRecords<AgentChatThreadTargetRecord>({
    objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
    skip: !isRecordLinkable,
    filter,
    orderBy: CHAT_THREADS_FOR_RECORD_ORDER_BY,
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

  const handleLinkCreated = useCallback(() => {
    void refetch();
  }, [refetch]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleLinkCreated,
    objectMetadataItemId: junctionConfig?.junctionObjectMetadata.id,
    operationTypes: LINK_OPERATION_TYPES,
    enabled: isRecordLinkable,
  });

  // A custom object leg carries no unique index, so a conversation can be
  // linked to the record more than once. Sorted here too, as an update patched
  // in from the chat's broadcast does not reorder the fetched page.
  const threads = sortChatThreadsByLastActivityDesc(
    uniqBy(links.map(({ thread }) => thread).filter(isDefined), 'id'),
  );

  const getLinkIdsToThread = (threadId: string) =>
    links.filter((link) => link.threadId === threadId).map(({ id }) => id);

  // Conversations are renamed, archived and deleted through the chat API,
  // which emits no record event, so its broadcast updates them here.
  const handleThreadOperation = useCallback(
    ({
      operation,
    }: MetadataOperationBrowserEventDetail<FlatAgentChatThread>) => {
      const threadId =
        operation.type === 'delete'
          ? operation.deletedRecordId
          : operation.type === 'update'
            ? operation.updatedRecord.id
            : undefined;
      const isThreadListed = links.some((link) => link.threadId === threadId);

      if (operation.type === 'update' && isThreadListed) {
        const { updatedRecord } = operation;

        apolloCoreClient.cache.modify({
          id: apolloCoreClient.cache.identify({
            __typename: getObjectTypename(
              CoreObjectNameSingular.AgentChatThread,
            ),
            id: updatedRecord.id,
          }),
          fields: {
            title: () => updatedRecord.title ?? null,
            archivedAt: () => updatedRecord.deletedAt ?? null,
            updatedAt: () => updatedRecord.updatedAt,
          },
        });

        return;
      }

      // A conversation past the page can move into it once it is updated.
      const shouldRefetch =
        operation.type === 'delete'
          ? isThreadListed
          : links.length >= CHAT_THREADS_FOR_RECORD_PAGE_SIZE;

      if (shouldRefetch) {
        void refetch();
      }
    },
    [apolloCoreClient, links, refetch],
  );

  useListenToMetadataOperationBrowserEvent<FlatAgentChatThread>({
    metadataName: 'agentChatThread',
    operationTypes: THREAD_OPERATION_TYPES,
    onMetadataOperationBrowserEvent: handleThreadOperation,
  });

  return { threads, getLinkIdsToThread, loading, error, refetch };
};
