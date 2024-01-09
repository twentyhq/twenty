import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { ViewType } from '../types/ViewType';

export const viewTypeScopedState = createStateScopeMap<ViewType>({
  key: 'viewTypeScopedState',
  defaultValue: ViewType.Table,
});
