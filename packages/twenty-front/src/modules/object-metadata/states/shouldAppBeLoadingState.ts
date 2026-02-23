import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const shouldAppBeLoadingState = createStateV2<boolean>({
  key: 'shouldAppBeLoadingState',
  defaultValue: false,
});
