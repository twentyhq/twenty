import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recentLocalMutationsState = createAtomState<
  Record<string, number>
>({
  key: 'recentLocalMutationsState',
  defaultValue: {},
});
