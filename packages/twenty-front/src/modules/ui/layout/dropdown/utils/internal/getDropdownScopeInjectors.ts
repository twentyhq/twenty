import { dropdownHotkeyScopeScopedState } from '@/ui/layout/dropdown/states/dropdownHotkeyScopeScopedState';
import { dropdownWidthScopedState } from '@/ui/layout/dropdown/states/dropdownWidthScopedState';
import { getScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';

export const getSelectableListScopeInjectors = () => {
  const dropdownHotkeyScopeScopeInjector = getScopeInjector(
    dropdownHotkeyScopeScopedState,
  );

  const dropdownWidthScopeInjector = getScopeInjector(dropdownWidthScopedState);

  const isDropdownOpenScopeInjector = getScopeInjector(
    dropdownWidthScopedState,
  );

  return {
    dropdownHotkeyScopeScopeInjector,
    dropdownWidthScopeInjector,
    isDropdownOpenScopeInjector,
  };
};
