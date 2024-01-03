import { dropdownHotkeyScopeScopedState } from '@/ui/layout/dropdown/states/dropdownHotkeyScopeScopedState';
import { dropdownWidthScopedState } from '@/ui/layout/dropdown/states/dropdownWidthScopedState';
import { isDropdownOpenScopedState } from '@/ui/layout/dropdown/states/isDropdownOpenScopedState';
import { getScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';

export const getDropdownScopeInjectors = () => {
  const dropdownHotkeyScopeScopeInjector = getScopeInjector(
    dropdownHotkeyScopeScopedState,
  );

  const dropdownWidthScopeInjector = getScopeInjector(dropdownWidthScopedState);

  const isDropdownOpenScopeInjector = getScopeInjector(
    isDropdownOpenScopedState,
  );

  return {
    dropdownHotkeyScopeScopeInjector,
    dropdownWidthScopeInjector,
    isDropdownOpenScopeInjector,
  };
};
