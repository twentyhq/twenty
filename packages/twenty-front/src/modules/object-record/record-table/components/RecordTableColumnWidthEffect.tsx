import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { useRecordTableFirstColumnWidthOverride } from '@/object-record/record-table/hooks/useRecordTableFirstColumnWidthOverride';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { RECORD_TABLE_VIRTUALIZATION_BODY_PLACEHOLDER_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableColumnWidthEffect = () => {
  const [resizedFieldMetadataId] = useAtomComponentState(
    resizedFieldMetadataIdComponentState,
  );

  const { visibleRecordFields, recordTableId } = useRecordTableContextOrThrow();

  const firstColumnWidthOverride = useRecordTableFirstColumnWidthOverride();

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
  );

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  useEffect(() => {
    if (isDefined(resizedFieldMetadataId)) {
      return;
    }

    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields: visibleRecordFields,
      firstColumnWidthOverride,
      tableWidth: recordTableWidth,
      isDragColumnHidden: isRecordTableDragColumnHidden,
      isCheckboxColumnHidden: isRecordTableCheckboxColumnHidden,
    });

    const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable(
      {
        firstColumnWidthOverride,
        visibleRecordFields,
      },
    );

    const dragColumnWidth = isRecordTableDragColumnHidden
      ? 0
      : RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH;

    const checkboxColumnWidth = isRecordTableCheckboxColumnHidden
      ? 0
      : RECORD_TABLE_COLUMN_CHECKBOX_WIDTH;

    const leftColumnsWidth = dragColumnWidth + checkboxColumnWidth;

    const totalTableBodyWidth =
      visibleRecordFieldsWidth +
      leftColumnsWidth +
      RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
      lastColumnWidth +
      visibleRecordFields.length;

    updateRecordTableCSSVariable(
      recordTableId,
      RECORD_TABLE_VIRTUALIZATION_BODY_PLACEHOLDER_WIDTH_CSS_VARIABLE_NAME,
      `${totalTableBodyWidth}px`,
    );

    updateRecordTableCSSVariable(
      recordTableId,
      RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
      `${lastColumnWidth}px`,
    );

    updateRecordTableCSSVariable(
      recordTableId,
      RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
      `${lastColumnWidth}px`,
    );

    for (const [index, recordField] of visibleRecordFields.entries()) {
      const columnWidth =
        index === 0 && isDefined(firstColumnWidthOverride)
          ? firstColumnWidthOverride
          : recordField.size;

      updateRecordTableCSSVariable(
        recordTableId,
        getRecordTableColumnFieldWidthCSSVariableName(index),
        `${columnWidth}px`,
      );
    }
  }, [
    resizedFieldMetadataId,
    visibleRecordFields,
    recordTableWidth,
    firstColumnWidthOverride,
    isRecordTableDragColumnHidden,
    isRecordTableCheckboxColumnHidden,
    recordTableId,
  ]);

  return null;
};
