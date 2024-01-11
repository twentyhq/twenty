import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isRowSelectedFamilyStateScopeMap = createFamilyStateScopeMap<
  boolean,
  string
>({
  key: 'isRowSelectedFamilyStateScopeMap',
  defaultValue: false,
});
