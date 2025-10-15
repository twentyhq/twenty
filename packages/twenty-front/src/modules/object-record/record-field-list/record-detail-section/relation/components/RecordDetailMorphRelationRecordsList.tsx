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

export const RecordDetailMorphRelationRecordsList = ({
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
        .map((recordsWithObjectNameSingular) => (
          <Fragment
            key={`${recordsWithObjectNameSingular.value.id}-${recordsWithObjectNameSingular.fieldMetadataId}`}
          >
            <RecordDetailRelationRecordsListItemEffect
              key={`${recordsWithObjectNameSingular.value.id}-effect`}
              relationRecordId={recordsWithObjectNameSingular.value.id}
              relationObjectMetadataNameSingular={
                recordsWithObjectNameSingular.objectNameSingular
              }
            />
            <RecordDetailRelationRecordsListItem
              key={recordsWithObjectNameSingular.value.id}
              isExpanded={
                expandedItem === recordsWithObjectNameSingular.value.id
              }
              onClick={handleItemClick}
              relationRecord={recordsWithObjectNameSingular.value}
              relationObjectMetadataNameSingular={
                recordsWithObjectNameSingular.objectNameSingular
              }
              relationFieldMetadataId={
                recordsWithObjectNameSingular.fieldMetadataId
              }
            />
          </Fragment>
        ))}
    </RecordDetailRecordsListContainer>
  );
};
