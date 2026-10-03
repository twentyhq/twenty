import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isToggleMineFilterPerView } from '@/views/utils/isToggleMineFilterPerView';

// Last choice per view id, read only when a view opens so open windows stay independent
export const toggleMineFilterPerViewState = createAtomState<
  Record<string, boolean>
>({
  key: 'toggleMineFilterPerViewState',
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: isToggleMineFilterPerView,
});
