import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const dataPagesLoadedComponentState = createComponentState<number[]>({
  key: 'dataPagesLoadedComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: [],
});
