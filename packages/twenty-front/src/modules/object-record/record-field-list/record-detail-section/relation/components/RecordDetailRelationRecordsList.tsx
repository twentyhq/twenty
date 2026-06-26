import { Fragment, useState } from 'react';

import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type RecordDetailRelationRecordsListProps = {
  objectNameSingular: string;
  value: ObjectRecord;
  fieldMetadataId: string;
};

export const RecordDetailRelationRecordsList = ({
  recordsWithObjectNameSingular,
}: {
  recordsWithObjectNameSingular: RecordDetailRelationRecordsListProps[];
}) => {
  const [expandedItem, setExpandedItem] = useState('');

  const handleItemClick = (recordId: string) =>
    setExpandedItem(recordId === expandedItem ? '' : recordId);

  return (
    <RecordDetailRecordsListContainer>
      {recordsWithObjectNameSingular
        .slice(0, 5)
        .map((recordWithObjectNameSingular) => (
          <Fragment
            key={`${recordWithObjectNameSingular.value.id}-${recordWithObjectNameSingular.fieldMetadataId}`}
          >
            <RecordDetailRelationRecordsListItemEffect
              key={`${recordWithObjectNameSingular.value.id}-effect`}
              relationRecordId={recordWithObjectNameSingular.value.id}
              relationObjectMetadataNameSingular={
                recordWithObjectNameSingular.objectNameSingular
              }
            />
            <RecordDetailRelationRecordsListItem
              key={recordWithObjectNameSingular.value.id}
              isExpanded={
                expandedItem === recordWithObjectNameSingular.value.id
              }
              onClick={handleItemClick}
              relationRecord={recordWithObjectNameSingular.value}
              relationObjectMetadataNameSingular={
                recordWithObjectNameSingular.objectNameSingular
              }
              relationFieldMetadataId={
                recordWithObjectNameSingular.fieldMetadataId
              }
            />
          </Fragment>
        ))}
    </RecordDetailRecordsListContainer>
  );
};
