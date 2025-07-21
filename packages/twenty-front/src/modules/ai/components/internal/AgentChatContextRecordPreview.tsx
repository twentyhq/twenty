import { RecordChip } from '@/object-record/components/RecordChip';
import { AgentChatMultipleRecordPreview } from '@/ai/components/internal/AgentChatMultipleRecordPreview';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';

export const AgentChatContextRecordPreview = ({
  agentId,
}: {
  agentId: string;
}) => {
  const { records, totalCount } = useFindManyRecordsSelectedInContextStore({
    limit: 3,
  });

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataItemId ?? '',
  });

  return (
    <>
      {/*{records.length < 3 ? (*/}
      {/*  records.map((record) => (*/}
      {/*    <RecordChip*/}
      {/*      key={record.id}*/}
      {/*      objectNameSingular={objectMetadataItem.nameSingular}*/}
      {/*      record={record}*/}
      {/*    />*/}
      {/*  ))*/}
      {/*) : (*/}
      {totalCount !== 0 && (
        <AgentChatMultipleRecordPreview
          agentId={agentId}
          objectMetadataItem={objectMetadataItem}
          records={records}
          totalCount={totalCount ?? 0}
        />
      )}
      {/*)}*/}
    </>
  );
};
