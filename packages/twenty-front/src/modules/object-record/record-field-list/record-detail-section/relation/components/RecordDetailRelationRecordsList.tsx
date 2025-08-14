import { Fragment, useState } from 'react';

import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

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
    <RecordDetailRecordsListContainer>
      {relationRecords.slice(0, 5).map((relationRecord) => (
        <Fragment key={relationRecord.id}>
          <RecordDetailRelationRecordsListItemEffect
            key={`${relationRecord.id}-effect`}
            relationRecordId={relationRecord.id}
          />
          <RecordDetailRelationRecordsListItem
            key={relationRecord.id}
            isExpanded={expandedItem === relationRecord.id}
            onClick={handleItemClick}
            relationRecord={relationRecord}
          />
        </Fragment>
      ))}
    </RecordDetailRecordsListContainer>
  );
};
