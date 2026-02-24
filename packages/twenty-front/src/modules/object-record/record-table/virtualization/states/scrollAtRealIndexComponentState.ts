import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const scrollAtRealIndexComponentState = createComponentStateV2<number>({
  key: 'scrollAtRealIndexComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: 0,
});
