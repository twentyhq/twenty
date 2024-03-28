import { createComponentState } from 'twenty-ui';

import { ViewType } from '@/views/types/ViewType';

export const viewPickerTypeComponentState = createComponentState<ViewType>({
  key: 'viewPickerTypeComponentState',
  defaultValue: ViewType.Table,
});
