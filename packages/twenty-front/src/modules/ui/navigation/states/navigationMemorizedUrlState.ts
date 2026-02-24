import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const navigationMemorizedUrlState = createState<string>({
  key: 'navigationMemorizedUrlState',
  defaultValue: '/',
});
