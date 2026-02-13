import { createState } from '@/ui/utilities/state/utils/createState';

export const currentPageLayoutIdState = createState<string | null>({
  key: 'currentPageLayoutIdState',
  defaultValue: null,
});
