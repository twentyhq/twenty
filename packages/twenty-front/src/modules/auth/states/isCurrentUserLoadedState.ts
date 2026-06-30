import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isCurrentUserLoadedState = createAtomState<boolean>({
  key: 'isCurrentUserLoadedState',
  defaultValue: false,
});
