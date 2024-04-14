import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordTablePendingRecordIdComponentState = createComponentState<
  string | null
>({
  key: 'recordTablePendingRecordIdState',
  defaultValue: null,
});
