import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const dataLoadingStatusByRealIndexComponentState = createComponentState<
  Map<number, 'loaded' | 'not-loaded'>
>({
  key: 'dataLoadingStatusByRealIndexComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: new Map(),
});
