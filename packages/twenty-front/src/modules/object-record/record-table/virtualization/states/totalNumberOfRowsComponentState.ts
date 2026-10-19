import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const totalNumberOfRowsComponentState = createAtomComponentState<
  number | null
>({
  key: 'totalNumberOfRowsComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: null,
});
