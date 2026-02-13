import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const previousUrlState = createStateV2<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
