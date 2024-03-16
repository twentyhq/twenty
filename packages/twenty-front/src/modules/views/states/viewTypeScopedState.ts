import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ViewType } from '../types/ViewType';

export const viewTypeScopedState = createComponentState<ViewType>({
  key: 'viewTypeScopedState',
  defaultValue: ViewType.Table,
});
