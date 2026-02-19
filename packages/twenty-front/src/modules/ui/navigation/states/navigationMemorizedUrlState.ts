import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const navigationMemorizedUrlState = createStateV2<string>({
  key: 'navigationMemorizedUrlState',
  defaultValue: '/',
});
