import { type PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const prefetchIsLoadedFamilyState = createFamilyStateV2<
  boolean,
  PrefetchKey
>({
  key: 'prefetchIsLoadedFamilyState',
  defaultValue: false,
});
