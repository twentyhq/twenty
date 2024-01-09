import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { ViewField } from '../types/ViewField';

export const onViewFieldsChangeScopedState = createStateScopeMap<
  ((fields: ViewField[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFieldsChangeScopedState',
  defaultValue: undefined,
});
