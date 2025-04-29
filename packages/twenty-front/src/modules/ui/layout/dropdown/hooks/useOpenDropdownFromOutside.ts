import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilCallback } from 'recoil';

export const useOpenDropdownFromOutside = () => {
  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const openDropdownFromOutside = useRecoilCallback(
    ({ set }) => {
      return (dropdownId: string) => {
        const dropdownOpenState = extractComponentState(
          isDropdownOpenComponentState,
          dropdownId,
        );

        setActiveDropdownFocusIdAndMemorizePrevious(dropdownId);
        setHotkeyScopeAndMemorizePreviousScope(dropdownId);

        set(dropdownOpenState, true);
      };
    },
    [
      setActiveDropdownFocusIdAndMemorizePrevious,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );

  return { openDropdownFromOutside };
};
