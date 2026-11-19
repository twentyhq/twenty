import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxListRecordSelectionInstanceIdState = createAtomState<
  string | null
>({
  key: 'inboxListRecordSelectionInstanceIdState',
  defaultValue: null,
});
