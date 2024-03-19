import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ViewField } from '../types/ViewField';

export const onViewFieldsChangeScopedState = createComponentState<
  ((fields: ViewField[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFieldsChangeScopedState',
  defaultValue: undefined,
});
