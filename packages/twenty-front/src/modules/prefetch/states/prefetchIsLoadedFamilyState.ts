import { type PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const prefetchIsLoadedFamilyState = createAtomFamilyState<
  boolean,
  PrefetchKey
>({
  key: 'prefetchIsLoadedFamilyState',
  defaultValue: false,
});
