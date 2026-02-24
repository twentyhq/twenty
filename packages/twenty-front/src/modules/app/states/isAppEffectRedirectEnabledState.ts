import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isAppEffectRedirectEnabledState = createState<boolean>({
  key: 'isAppEffectRedirectEnabledState',
  defaultValue: true,
});
