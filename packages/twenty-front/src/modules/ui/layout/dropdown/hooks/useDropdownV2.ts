import { useRecoilCallback } from 'recoil';

import { dropdownHotkeyComponentState } from '@/ui/layout/dropdown/states/dropdownHotkeyComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { isDefined } from '~/utils/isDefined';

export const useDropdownV2 = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeDropdown = useRecoilCallback(
    ({ set }) =>
      (specificComponentId: string) => {
        const scopeId = getScopeIdFromComponentId(specificComponentId);

        goBackToPreviousHotkeyScope();
        set(
          isDropdownOpenComponentState({
            scopeId,
          }),
          false,
        );
      },
    [goBackToPreviousHotkeyScope],
  );

  const openDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (specificComponentId: string, customHotkeyScope?: HotkeyScope) => {
        const scopeId = getScopeIdFromComponentId(specificComponentId);

        const dropdownHotkeyScope = snapshot
          .getLoadable(dropdownHotkeyComponentState({ scopeId }))
          .getValue();

        set(
          isDropdownOpenComponentState({
            scopeId,
          }),
          true,
        );

        if (isDefined(customHotkeyScope)) {
          setHotkeyScopeAndMemorizePreviousScope(
            customHotkeyScope.scope,
            customHotkeyScope.customScopes,
          );
        } else if (isDefined(dropdownHotkeyScope)) {
          setHotkeyScopeAndMemorizePreviousScope(
            dropdownHotkeyScope.scope,
            dropdownHotkeyScope.customScopes,
          );
        }
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  const toggleDropdown = useRecoilCallback(
    ({ snapshot }) =>
      (specificComponentId: string) => {
        const scopeId = getScopeIdFromComponentId(specificComponentId);
        const isDropdownOpen = snapshot
          .getLoadable(isDropdownOpenComponentState({ scopeId }))
          .getValue();

        if (isDropdownOpen) {
          closeDropdown(specificComponentId);
        } else {
          openDropdown(specificComponentId);
        }
      },
    [closeDropdown, openDropdown],
  );

  return {
    closeDropdown,
    openDropdown,
    toggleDropdown,
  };
};
