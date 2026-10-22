import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const scrollAtRowIndexComponentState = createAtomComponentState<number>({
  key: 'scrollAtRowIndexComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: 0,
});
