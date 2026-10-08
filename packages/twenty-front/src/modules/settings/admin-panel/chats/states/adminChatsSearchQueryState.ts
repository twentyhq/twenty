import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const adminChatsSearchQueryState = createAtomState<string>({
  key: 'adminChatsSearchQueryState',
  defaultValue: '',
});
