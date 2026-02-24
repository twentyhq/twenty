import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
