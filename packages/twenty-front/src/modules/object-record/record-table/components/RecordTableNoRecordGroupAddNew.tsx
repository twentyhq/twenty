import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { RecordTableWidgetJunctionAddNewRow } from '@/object-record/record-table-widget/components/RecordTableWidgetJunctionAddNewRow';
import { RecordTableWidgetNestedRelationAddNewRow } from '@/object-record/record-table-widget/components/RecordTableWidgetNestedRelationAddNewRow';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useLoadRecordsAtRowIndexes } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsAtRowIndexes';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { recordTableRowIndexByRecordIdComponentSelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexByRecordIdComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useCallback, useContext } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

export const RecordTableNoRecordGroupAddNew = () => {
  const { objectMetadataItem, recordTableId } = useRecordTableContextOrThrow();

  const recordTableWidgetContext = useContext(RecordTableWidgetContext);
  const nestedRelationCreateThrough =
    recordTableWidgetContext?.nestedRelationCreateThrough;
  const junctionCreateThrough = recordTableWidgetContext?.junctionCreateThrough;

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const store = useStore();

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const rowIndexByRecordIdCallbackState = useAtomComponentSelectorCallbackState(
    recordTableRowIndexByRecordIdComponentSelector,
  );

  const { loadRecordsAtRowIndexes } = useLoadRecordsAtRowIndexes();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const handleCreateRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      const createdRecord = await createNewIndexRecord({
        position: 'last',
        ...recordInput,
      });

      if (!isDefined(createdRecord)) {
        return;
      }

      upsertRecordsInStore({ partialRecords: [createdRecord] });

      const isAlreadyPlaced = store
        .get(rowIndexByRecordIdCallbackState)
        .has(createdRecord.id);

      const totalNumberOfRows = store.get(totalNumberOfRowsCallbackState);

      if (!isAlreadyPlaced && isDefined(totalNumberOfRows)) {
        loadRecordsAtRowIndexes({
          records: [createdRecord],
          startingRowIndex: totalNumberOfRows,
        });
      }
    },
    [
      createNewIndexRecord,
      upsertRecordsInStore,
      loadRecordsAtRowIndexes,
      rowIndexByRecordIdCallbackState,
      store,
      totalNumberOfRowsCallbackState,
    ],
  );

  if (isRecordTableCellsNonEditable) {
    return null;
  }

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  // Linking through a junction never creates a record of the table's object, so its creatability does not apply.
  if (isDefined(junctionCreateThrough)) {
    return (
      <RecordTableWidgetJunctionAddNewRow
        dropdownId={`${recordTableId}-junction-add-new`}
        junctionCreateThrough={junctionCreateThrough}
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

  if (isDefined(nestedRelationCreateThrough)) {
    return (
      <RecordTableWidgetNestedRelationAddNewRow
        dropdownId={`${recordTableId}-nested-relation-add-new`}
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
      onClick={() => handleCreateRecord()}
      LeftIcon={IconPlus}
      text={t`Add New`}
    />
  );
};
