import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordTableRenderedColumnRangeComponentState =
  createAtomComponentState<RecordTableColumnRange | null>({
    key: 'recordTableRenderedColumnRangeComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
