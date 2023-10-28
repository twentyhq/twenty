import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { ViewField } from '../types/ViewField';

export const onViewFieldsChangeScopedState = createScopedState<
  ((fields: ViewField[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFieldsChangeScopedState',
  defaultValue: undefined,
});
