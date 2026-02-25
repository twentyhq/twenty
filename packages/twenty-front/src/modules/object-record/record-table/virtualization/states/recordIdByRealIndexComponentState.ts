import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIdByRealIndexComponentState = createAtomComponentState<
  Map<number, string>
>({
  key: 'recordIdByRealIndexComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: new Map(),
});
