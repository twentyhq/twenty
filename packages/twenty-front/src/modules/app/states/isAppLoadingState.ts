import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isAppLoadingState = createStateV2<boolean>({
  key: 'isAppLoadingState',
  defaultValue: true,
});
