import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const canManageFeatureFlagsState = createStateV2<boolean>({
  key: 'canManageFeatureFlagsState',
  defaultValue: false,
});
