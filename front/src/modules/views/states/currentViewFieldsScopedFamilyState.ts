import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { ViewField } from '../types/ViewField';

export const currentViewFieldsScopedFamilyState = createScopedFamilyState<
  ViewField[],
  string
>({
  key: 'currentViewFieldsScopedFamilyState',
  defaultValue: [],
});
