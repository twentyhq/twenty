import uniqBy from 'lodash.uniqby';
import { useCallback } from 'react';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_TARGET_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadTargetObjectNameSingular';
import { useAgentChatThreadJunctionConfig } from '@/ai/hooks/useAgentChatThreadJunctionConfig';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { findAgentChatThreadTargetFieldInfo } from '@/ai/utils/findAgentChatThreadTargetFieldInfo';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
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

const THREAD_OPERATION_TYPES: MetadataOperation<FlatAgentChatThread>['type'][] =
  ['update', 'delete'];

export const useChatThreadsForRecord = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useAgentChatThreadJunctionConfig();

  const targetJoinColumnName = isDefined(junctionConfig)
    ? findAgentChatThreadTargetFieldInfo({
        targetFields: junctionConfig.targetFields,
        objectNameSingular: targetObjectNameSingular,
        objectMetadataItems,
      })?.joinColumnName
    : undefined;

  const {
    records: links,
    loading,
    error,
    refetch,
  } = useFindManyRecords<AgentChatThreadTargetRecord>({
    objectNameSingular: AGENT_CHAT_THREAD_TARGET_OBJECT_NAME_SINGULAR,
    skip: !isDefined(targetJoinColumnName),
    filter: isDefined(targetJoinColumnName)
      ? { [targetJoinColumnName]: { eq: id } }
      : undefined,
    orderBy: CHAT_THREADS_FOR_RECORD_ORDER_BY,
    recordGqlFields: CHAT_THREADS_FOR_RECORD_GQL_FIELDS,
    limit: CHAT_THREADS_FOR_RECORD_PAGE_SIZE,
  });

  // A custom object leg carries no unique index, so a conversation can be
  // linked to the record more than once.
  const threads = uniqBy(
    links.map(({ thread }) => thread).filter(isDefined),
    'id',
  );

  const getLinkIdsToThread = (threadId: string) =>
    links.filter((link) => link.threadId === threadId).map(({ id }) => id);

  // Conversations are renamed, archived and deleted through the chat API,
  // which never updates these records, so its broadcast refreshes them.
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

      if (links.some((link) => link.threadId === threadId)) {
        void refetch();
      }
    },
    [links, refetch],
  );

  useListenToMetadataOperationBrowserEvent<FlatAgentChatThread>({
    metadataName: 'agentChatThread',
    operationTypes: THREAD_OPERATION_TYPES,
    onMetadataOperationBrowserEvent: handleThreadOperation,
  });

  return { threads, getLinkIdsToThread, loading, error, refetch };
};
