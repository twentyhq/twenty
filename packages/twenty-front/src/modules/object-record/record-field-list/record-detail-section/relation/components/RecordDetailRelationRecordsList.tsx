import { Fragment, useContext, useState } from 'react';

import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';

type RecordDetailRelationRecordsListProps = {
  relationRecords: ObjectRecord[];
};

export const RecordDetailRelationRecordsList = ({
  relationRecords,
}: RecordDetailRelationRecordsListProps) => {
  const [expandedItem, setExpandedItem] = useState('');
  const { fieldDefinition } = useContext(FieldContext);
  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );
  const handleItemClick = (recordId: string) =>
    setExpandedItem(recordId === expandedItem ? '' : recordId);

  return (
    <RecordDetailRecordsListContainer>
      {relationRecords.slice(0, 5).map((relationRecord) => (
        <Fragment key={relationRecord.id}>
          <RecordDetailRelationRecordsListItemEffect
            key={`${relationRecord.id}-effect`}
            relationRecordId={relationRecord.id}
            relationObjectMetadataNameSingular={
              fieldDefinition.metadata.relationObjectMetadataNameSingular
            }
          />
          <RecordDetailRelationRecordsListItem
            key={relationRecord.id}
            isExpanded={expandedItem === relationRecord.id}
            onClick={handleItemClick}
            relationRecord={relationRecord}
            relationObjectMetadataNameSingular={
              fieldDefinition.metadata.relationObjectMetadataNameSingular
            }
            relationFieldMetadataId={
              fieldDefinition.metadata.relationFieldMetadataId
            }
          />
        </Fragment>
      ))}
    </RecordDetailRecordsListContainer>
  );
};
