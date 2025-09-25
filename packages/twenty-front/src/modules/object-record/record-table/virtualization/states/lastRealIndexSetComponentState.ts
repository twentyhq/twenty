import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const lastRealIndexSetComponentState = createComponentState<
  number | null
>({
  key: 'lastRealIndexSetComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: null,
});
