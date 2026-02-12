import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isActivityInCreateModeState = createStateV2<boolean>({
  key: 'isActivityInCreateModeState',
  defaultValue: false,
});
