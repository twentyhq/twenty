import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { ViewField } from '../types/ViewField';

export const currentViewFieldsScopedFamilyState = createFamilyStateScopeMap<
  ViewField[],
  string
>({
  key: 'currentViewFieldsScopedFamilyState',
  defaultValue: [],
});
