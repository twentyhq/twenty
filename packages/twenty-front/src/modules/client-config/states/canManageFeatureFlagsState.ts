import { createState } from 'twenty-ui/utilities';
export const canManageFeatureFlagsState = createState<boolean>({
  key: 'canManageFeatureFlagsState',
  defaultValue: false,
});
