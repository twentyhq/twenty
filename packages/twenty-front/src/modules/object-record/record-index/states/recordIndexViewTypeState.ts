import { createState } from "twenty-shared";

import { ViewType } from '@/views/types/ViewType';

export const recordIndexViewTypeState = createState<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
