import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const currentPageLocationState = createState<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
