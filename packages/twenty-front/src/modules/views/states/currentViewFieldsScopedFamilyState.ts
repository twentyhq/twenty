import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { ViewField } from '../types/ViewField';

export const currentViewFieldsScopedFamilyState = createComponentFamilyState<
  ViewField[],
  string
>({
  key: 'currentViewFieldsScopedFamilyState',
  defaultValue: [],
});
