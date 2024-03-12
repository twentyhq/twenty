import { PrefetchKey } from '@/prefetch/types/PrefetchKeys';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const prefetchIsLoadedFamilyState = createFamilyState<
  boolean,
  PrefetchKey
>({
  key: 'prefetchIsLoadedFamilyState',
  defaultValue: false,
});
