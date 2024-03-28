import { useState } from 'react';

import { RecordDetailRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRecordsList';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsListItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type RecordDetailRelationRecordsListProps = {
  relationRecords: ObjectRecord[];
};

export const RecordDetailRelationRecordsList = ({
  relationRecords,
}: RecordDetailRelationRecordsListProps) => {
  const [expandedItem, setExpandedItem] = useState('');

  const handleItemClick = (recordId: string) =>
    setExpandedItem(recordId === expandedItem ? '' : recordId);

  return (
    <RecordDetailRecordsList>
      {relationRecords.slice(0, 5).map((relationRecord) => (
        <RecordDetailRelationRecordsListItem
          key={relationRecord.id}
          isExpanded={expandedItem === relationRecord.id}
          onClick={handleItemClick}
          relationRecord={relationRecord}
        />
      ))}
    </RecordDetailRecordsList>
  );
};
