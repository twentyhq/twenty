import { useRecoilCallback } from 'recoil';

import { dropdownHotkeyComponentState } from '@/ui/layout/dropdown/states/dropdownHotkeyComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { isDefined } from '~/utils/isDefined';

export const useDropdownRemotely = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeDropdownRemotely = useRecoilCallback(
    ({ set }) =>
      (componentId: string) => {
        const scopeId = getScopeIdFromComponentId(componentId);

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

  const openDropdownRemotely = useRecoilCallback(
    ({ set, snapshot }) =>
      (componentId: string, customHotkeyScope?: HotkeyScope) => {
        const scopeId = getScopeIdFromComponentId(componentId);

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

  const toggleDropdownRemotely = useRecoilCallback(
    ({ snapshot }) =>
      (componentId: string) => {
        const scopeId = getScopeIdFromComponentId(componentId);
        const isDropdownOpen = snapshot
          .getLoadable(isDropdownOpenComponentState({ scopeId }))
          .getValue();

        if (isDropdownOpen) {
          closeDropdownRemotely(componentId);
        } else {
          openDropdownRemotely(componentId);
        }
      },
    [closeDropdownRemotely, openDropdownRemotely],
  );

  return {
    closeDropdownRemotely,
    openDropdownRemotely,
    toggleDropdownRemotely,
  };
};
