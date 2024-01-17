import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const dropdownWidthStateScopeMap = createStateScopeMap<
  number | undefined
>({
  key: 'dropdownWidthStateScopeMap',
  defaultValue: 160,
});
