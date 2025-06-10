import { View } from '@/views/types/View';
import { createState } from 'twenty-ui/utilities';

export const prefetchViewsState = createState<View[]>({
  key: 'prefetchViewsState',
  defaultValue: [],
});
