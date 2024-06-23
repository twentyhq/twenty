import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectRecordsIdsMultiSelecComponenttState = createComponentState<
  string[]
>({
  key: 'objectRecordsIdsMultiSelectComponentState',
  defaultValue: [],
});
