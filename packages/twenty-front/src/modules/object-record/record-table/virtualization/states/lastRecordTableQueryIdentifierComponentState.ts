import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const lastScrollPositionComponentState = createComponentState<number>({
  key: 'lastScrollPositionComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: 0,
});
