import { createState } from '@/ui/utilities/state/utils/createState';
export const isAppEffectRedirectEnabledState = createState<boolean>({
  key: 'isAppEffectRedirectEnabledState',
  defaultValue: true,
});
