import { createFamilyState } from 'twenty-ui';

import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const prefetchIsLoadedFamilyState = createFamilyState<
  boolean,
  PrefetchKey
>({
  key: 'prefetchIsLoadedFamilyState',
  defaultValue: false,
});
