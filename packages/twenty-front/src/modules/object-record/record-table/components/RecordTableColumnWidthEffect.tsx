import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { RECORD_TABLE_VIRTUALIZATION_BODY_PLACEHOLDER_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableColumnWidthEffect = () => {
  const [resizedFieldMetadataItemId] = useRecoilComponentState(
    resizedFieldMetadataIdComponentState,
  );

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const shouldCompactRecordTableFirstColumn = useRecoilComponentValue(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const recordTableWidth = useRecoilComponentValue(
    recordTableWidthComponentState,
  );

  useEffect(() => {
    if (isDefined(resizedFieldMetadataItemId)) {
      return;
    }

    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields: visibleRecordFields,
      shouldCompactFirstColumn: shouldCompactRecordTableFirstColumn,
      tableWidth: recordTableWidth,
    });

    const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable(
      {
        shouldCompactFirstColumn: shouldCompactRecordTableFirstColumn,
        visibleRecordFields,
      },
    );

    const totalTableBodyWidth =
      visibleRecordFieldsWidth +
      RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
      RECORD_TABLE_COLUMN_CHECKBOX_WIDTH +
      RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
      lastColumnWidth +
      visibleRecordFields.length;

    updateRecordTableCSSVariable(
      RECORD_TABLE_VIRTUALIZATION_BODY_PLACEHOLDER_WIDTH_CSS_VARIABLE_NAME,
      `${totalTableBodyWidth}px`,
    );

    updateRecordTableCSSVariable(
      RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
      `${lastColumnWidth}px`,
    );

    updateRecordTableCSSVariable(
      RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
      `${lastColumnWidth}px`,
    );

    for (const [index, recordField] of visibleRecordFields.entries()) {
      updateRecordTableCSSVariable(
        getRecordTableColumnFieldWidthCSSVariableName(index),
        `${recordField.size}px`,
      );
    }

    if (shouldCompactRecordTableFirstColumn) {
      updateRecordTableCSSVariable(
        getRecordTableColumnFieldWidthCSSVariableName(0),
        `${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px`,
      );
    } else {
      const firstColumnWidth =
        visibleRecordFields[0]?.size ?? RECORD_TABLE_COLUMN_MIN_WIDTH;

      updateRecordTableCSSVariable(
        getRecordTableColumnFieldWidthCSSVariableName(0),
        `${firstColumnWidth}px`,
      );
    }
  }, [
    resizedFieldMetadataItemId,
    visibleRecordFields,
    recordTableWidth,
    shouldCompactRecordTableFirstColumn,
  ]);

  return null;
};
