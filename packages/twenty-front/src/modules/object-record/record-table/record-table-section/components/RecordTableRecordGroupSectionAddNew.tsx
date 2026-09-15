import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { RecordTableWidgetJunctionAddNewRow } from '@/object-record/record-table-widget/components/RecordTableWidgetJunctionAddNewRow';
import { RecordTableWidgetNestedRelationAddNewRow } from '@/object-record/record-table-widget/components/RecordTableWidgetNestedRelationAddNewRow';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

export const RecordTableRecordGroupSectionAddNew = () => {
  const { objectMetadataItem, recordTableId } = useRecordTableContextOrThrow();

  const recordTableWidgetContext = useContext(RecordTableWidgetContext);
  const nestedRelationCreateThrough =
    recordTableWidgetContext?.nestedRelationCreateThrough;
  const junctionCreateThrough = recordTableWidgetContext?.junctionCreateThrough;

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    currentRecordGroupId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexGroupFieldMetadataItem?.id,
  );

  const { recordGroupFilter } = useRecordGroupFilter(objectMetadataItem.fields);

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  if (isRecordTableCellsNonEditable) {
    return null;
  }

  // Linking through a junction never creates a record of the table's object,
  // so the target object's creatability does not apply. The picker only
  // offers records of this group, so the linked row lands where it was added.
  if (isDefined(junctionCreateThrough)) {
    return (
      <RecordTableWidgetJunctionAddNewRow
        dropdownId={`${recordTableId}-${currentRecordGroupId}-junction-add-new`}
        junctionCreateThrough={junctionCreateThrough}
        targetRecordsFilter={
          makeAndFilterVariables([
            junctionCreateThrough.targetRecordsFilter,
            recordGroupFilter,
          ]) ?? junctionCreateThrough.targetRecordsFilter
        }
      />
    );
  }

  if (
    !canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    })
  ) {
    return null;
  }

  const handleCreateRecord = (recordInput?: Partial<ObjectRecord>) => {
    if (!fieldMetadataItem) {
      return;
    }

    createNewIndexRecord({
      position: 'last',
      [getFieldMetadataItemGqlFieldName(fieldMetadataItem)]:
        recordGroupDefinition?.value,
      ...recordInput,
    });
  };

  if (isDefined(nestedRelationCreateThrough)) {
    return (
      <RecordTableWidgetNestedRelationAddNewRow
        dropdownId={`${recordTableId}-${currentRecordGroupId}-nested-relation-add-new`}
        nestedRelationCreateThrough={nestedRelationCreateThrough}
        onRelationRecordSelected={(relationRecordId) =>
          handleCreateRecord({
            [nestedRelationCreateThrough.nestedRelationJoinColumnName]:
              relationRecordId,
          })
        }
      />
    );
  }

  return (
    <RecordTableActionRow
      LeftIcon={IconPlus}
      text={t`Add new`}
      onClick={() => handleCreateRecord()}
    />
  );
};
