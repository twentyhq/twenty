import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const hasUserSelectedCommandState = createStateV2({
  key: 'hasUserSelectedCommandState',
  defaultValue: false,
});
