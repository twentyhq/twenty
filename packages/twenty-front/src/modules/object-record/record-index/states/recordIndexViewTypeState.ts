import { type ViewType } from '@/views/types/ViewType';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const recordIndexViewTypeState = createState<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
