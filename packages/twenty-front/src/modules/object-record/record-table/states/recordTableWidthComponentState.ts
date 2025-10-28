import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordTableWidthComponentState = createComponentState<number>({
  key: 'recordTableWidthComponentState',
  defaultValue: 0,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
