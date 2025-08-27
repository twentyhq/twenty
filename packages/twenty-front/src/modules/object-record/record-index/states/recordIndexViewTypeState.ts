import { type ViewType } from '@/views/types/ViewType';
import { createState } from 'twenty-ui/utilities';

export const recordIndexViewTypeState = createState<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
