import { RecordDetailRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRecordsList';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsListItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type RecordDetailRelationRecordsListProps = {
  relationRecords: ObjectRecord[];
};

export const RecordDetailRelationRecordsList = ({
  relationRecords,
}: RecordDetailRelationRecordsListProps) => (
  <RecordDetailRecordsList>
    {relationRecords.slice(0, 5).map((relationRecord) => (
      <RecordDetailRelationRecordsListItem
        key={relationRecord.id}
        relationRecord={relationRecord}
      />
    ))}
  </RecordDetailRecordsList>
);
