import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordIdByRealIndexComponentState = createComponentStateV2<
  Map<number, string>
>({
  key: 'recordIdByRealIndexComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: new Map(),
});
