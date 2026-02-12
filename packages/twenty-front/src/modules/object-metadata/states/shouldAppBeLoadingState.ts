import { createState } from '@/ui/utilities/state/utils/createState';
export const shouldAppBeLoadingState = createState<boolean>({
  key: 'shouldAppBeLoadingState',
  defaultValue: false,
});
