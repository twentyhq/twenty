import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isToggleMineSelectedPerViewState = createAtomState<
  Record<string, boolean>
>({
  key: 'isToggleMineSelectedPerViewState',
  defaultValue: {},
});
