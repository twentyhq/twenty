import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const hasNextPageFamilyState = createFamilyStateV2<
  boolean,
  string | undefined
>({
  key: 'hasNextPageFamilyState',
  defaultValue: false,
});
