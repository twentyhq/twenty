import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

export const recordTableColumnIndexesRenderedOutsideRangeComponentSelector =
  createAtomComponentSelector<number[]>({
    key: 'recordTableColumnIndexesRenderedOutsideRangeComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const renderedColumnRange = get(
          recordTableRenderedColumnRangeComponentState,
          { instanceId },
        );

        return [
          get(recordTableFocusPositionComponentState, { instanceId }),
          get(recordTableHoverPositionComponentState, { instanceId }),
        ]
          .filter(isDefined)
          .map((cellPosition) => cellPosition.column)
          .filter(
            (columnIndex) =>
              !isRecordTableColumnRendered({
                columnIndex,
                renderedColumnRange,
                columnIndexesRenderedOutsideRange: [],
              }),
          );
      },
    areEqual: fastDeepEqual,
  });
