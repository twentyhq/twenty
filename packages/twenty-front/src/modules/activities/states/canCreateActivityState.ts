import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const canCreateActivityState = createStateV2<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
