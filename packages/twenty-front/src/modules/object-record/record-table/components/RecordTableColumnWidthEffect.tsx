import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableColumnWidthEffect = () => {
  const [resizedFieldMetadataItemId] = useRecoilComponentState(
    resizedFieldMetadataIdComponentState,
  );

  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  useEffect(() => {
    if (isDefined(resizedFieldMetadataItemId)) {
      return;
    }

    updateRecordTableCSSVariable(
      RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
      `${lastColumnWidth}px`,
    );

    for (const [index, recordField] of visibleRecordFields.entries()) {
      updateRecordTableCSSVariable(
        getRecordTableColumnFieldWidthCSSVariableName(index),
        `${recordField.size}px`,
      );
    }
  }, [lastColumnWidth, resizedFieldMetadataItemId, visibleRecordFields]);

  return null;
};
