import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { createState } from 'twenty-ui/utilities';

export const prefetchViewsState = createState<View[] | CoreViewWithRelations[]>(
  {
    key: 'prefetchViewsState',
    defaultValue: [],
  },
);
