import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastSelectedRowIndexComponentState = createAtomComponentState<
  number | null | undefined
>({
  key: 'record-table/last-selected-row-index',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
