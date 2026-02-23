import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isAppEffectRedirectEnabledState = createStateV2<boolean>({
  key: 'isAppEffectRedirectEnabledState',
  defaultValue: true,
});
