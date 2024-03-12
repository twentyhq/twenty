import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { ViewFilter } from '../types/ViewFilter';

export const savedViewFiltersScopedFamilyState = createComponentFamilyState<
  ViewFilter[],
  string
>({
  key: 'savedViewFiltersScopedFamilyState',
  defaultValue: [],
});
