import { createState } from '@/ui/utilities/state/utils/createState';
export const canManageFeatureFlagsState = createState<boolean>({
  key: 'canManageFeatureFlagsState',
  defaultValue: false,
});
