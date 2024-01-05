import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { ViewField } from '../types/ViewField';

export const savedViewFieldsScopedFamilyState = createFamilyStateScopeMap<
  ViewField[],
  string
>({
  key: 'savedViewFieldsScopedFamilyState',
  defaultValue: [],
});
