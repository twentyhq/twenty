import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { ViewType } from '../types/ViewType';

export const viewTypeScopedState = createScopedState<ViewType>({
  key: 'viewTypeScopedState',
  defaultValue: ViewType.Table,
});
