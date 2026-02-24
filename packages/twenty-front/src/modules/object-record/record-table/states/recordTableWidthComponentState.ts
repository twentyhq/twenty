import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordTableWidthComponentState = createComponentStateV2<number>({
  key: 'recordTableWidthComponentState',
  defaultValue: 0,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
