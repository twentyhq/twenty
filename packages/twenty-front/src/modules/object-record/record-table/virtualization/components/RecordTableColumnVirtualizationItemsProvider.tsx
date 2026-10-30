import { type ReactNode, useMemo } from 'react';

import { RecordTableColumnVirtualizationItemsContextValueProvider } from '@/object-record/record-table/contexts/RecordTableColumnVirtualizationItemsContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableColumnIndexesRenderedOutsideRangeComponentSelector } from '@/object-record/record-table/virtualization/states/recordTableColumnIndexesRenderedOutsideRangeComponentSelector';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { computeRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnRange';
import { computeRecordTableColumnVirtualizationItems } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnVirtualizationItems';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableColumnVirtualizationItemsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableRenderedColumnRange = useAtomComponentStateValue(
    recordTableRenderedColumnRangeComponentState,
  );

  const columnIndexesRenderedOutsideRange = useAtomComponentSelectorValue(
    recordTableColumnIndexesRenderedOutsideRangeComponentSelector,
  );

  const columnVirtualizationItems = useMemo(
    () =>
      computeRecordTableColumnVirtualizationItems({
        visibleRecordFields,
        renderedColumnRange:
          recordTableRenderedColumnRange ??
          computeRecordTableColumnRange({
            visibleRecordFields,
            visibleStartPosition: 0,
            visibleEndPosition: window.innerWidth,
          }),
        columnIndexesRenderedOutsideRange,
      }),
    [
      visibleRecordFields,
      recordTableRenderedColumnRange,
      columnIndexesRenderedOutsideRange,
    ],
  );

  return (
    <RecordTableColumnVirtualizationItemsContextValueProvider
      value={columnVirtualizationItems}
    >
      {children}
    </RecordTableColumnVirtualizationItemsContextValueProvider>
  );
};
