import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { ViewField } from '../types/ViewField';

export const savedViewFieldsScopedFamilyState = createComponentFamilyState<
  ViewField[],
  string
>({
  key: 'savedViewFieldsScopedFamilyState',
  defaultValue: [],
});
