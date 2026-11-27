import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const objectViewsHashesState = createAtomState<
  Record<string, string> | undefined
>({
  key: 'objectViewsHashesState',
  defaultValue: undefined,
});
