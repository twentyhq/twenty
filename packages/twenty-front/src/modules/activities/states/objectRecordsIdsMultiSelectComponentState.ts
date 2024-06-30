import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectRecordsIdsMultiSelecComponentState = createComponentState<
  string[]
>({
  key: 'objectRecordsIdsMultiSelectComponentState',
  defaultValue: [],
});
