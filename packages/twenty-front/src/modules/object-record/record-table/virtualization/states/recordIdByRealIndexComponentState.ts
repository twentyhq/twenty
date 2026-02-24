import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordIdByRealIndexComponentState = createComponentState<
  Map<number, string>
>({
  key: 'recordIdByRealIndexComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: new Map(),
});
