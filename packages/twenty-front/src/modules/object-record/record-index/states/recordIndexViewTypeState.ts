import { createState } from '@ui/utilities/state/utils/createState';

import { ViewType } from '@/views/types/ViewType';

export const recordIndexViewTypeState = createState<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
