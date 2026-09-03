import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedInboxItemIdState = createAtomState<string | null>({
  key: 'inbox/selectedInboxItemIdState',
  defaultValue: null,
});
