import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const canManageFeatureFlagsState = createState<boolean>({
  key: 'canManageFeatureFlagsState',
  defaultValue: false,
});
