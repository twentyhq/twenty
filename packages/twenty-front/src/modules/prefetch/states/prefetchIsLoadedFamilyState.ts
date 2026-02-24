import { type PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const prefetchIsLoadedFamilyState = createFamilyState<
  boolean,
  PrefetchKey
>({
  key: 'prefetchIsLoadedFamilyState',
  defaultValue: false,
});
