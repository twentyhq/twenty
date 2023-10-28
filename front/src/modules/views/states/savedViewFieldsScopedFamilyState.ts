import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { ViewField } from '../types/ViewField';

export const savedViewFieldsScopedFamilyState = createScopedFamilyState<
  ViewField[],
  string
>({
  key: 'savedViewFieldsScopedFamilyState',
  defaultValue: [],
});
