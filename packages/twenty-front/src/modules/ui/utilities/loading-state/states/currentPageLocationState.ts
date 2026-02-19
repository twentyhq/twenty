import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const currentPageLocationState = createStateV2<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
