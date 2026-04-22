import { Fragment, useState } from 'react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailInlineRelationCreateForm } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailInlineRelationCreateForm';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

type RelationRecordWithObjectNameSingular = {
  objectNameSingular: string;
  value: ObjectRecord;
  fieldMetadataId: string;
};

type RecordDetailRelationRecordsListProps = {
  recordsWithObjectNameSingular: RelationRecordWithObjectNameSingular[];
  inlineCreateRecordIds?: string[];
  relationObjectMetadataItem?: EnrichedObjectMetadataItem;
  relationFieldMetadataItem?: FieldMetadataItem;
  onInlineCreateDone?: (recordId: string) => void;
  onInlineCreateCancel?: (recordId: string) => void;
};

export const RecordDetailRelationRecordsList = ({
  recordsWithObjectNameSingular,
  inlineCreateRecordIds,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  onInlineCreateDone,
  onInlineCreateCancel,
}: RecordDetailRelationRecordsListProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();
  const [expandedItem, setExpandedItem] = useState('');

  const handleItemClick = (recordId: string) =>
    setExpandedItem(recordId === expandedItem ? '' : recordId);

  const showInlineCreateForms =
    isDefined(inlineCreateRecordIds) &&
    inlineCreateRecordIds.length > 0 &&
    isDefined(relationObjectMetadataItem) &&
    isDefined(relationFieldMetadataItem);

  return (
    <RecordDetailRecordsListContainer>
      {showInlineCreateForms &&
        inlineCreateRecordIds.map((newRecordId) => (
          <RecordDetailInlineRelationCreateForm
            key={newRecordId}
            newRecordId={newRecordId}
            relationObjectMetadataItem={relationObjectMetadataItem}
            relationFieldMetadataItem={relationFieldMetadataItem}
            scopeInstanceId={scopeInstanceId}
            onDone={() => onInlineCreateDone?.(newRecordId)}
            onCancel={onInlineCreateCancel ?? (() => {})}
          />
        ))}
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
