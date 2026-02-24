import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentPageLayoutIdState = createStateV2<string | null>({
  key: 'currentPageLayoutIdState',
  defaultValue: null,
});
