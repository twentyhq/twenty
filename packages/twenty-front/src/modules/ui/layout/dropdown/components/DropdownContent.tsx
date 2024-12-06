import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useInternalHotkeyScopeManagement } from '@/ui/layout/dropdown/hooks/useInternalHotkeyScopeManagement';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { dropdownMaxHeightComponentStateV2 } from '@/ui/layout/dropdown/states/dropdownMaxHeightComponentStateV2';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import {
  FloatingPortal,
  Placement,
  UseFloatingReturn,
} from '@floating-ui/react';
import { useEffect } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

export type DropdownContentProps = {
  className?: string;
  dropdownId: string;
  dropdownPlacement: Placement;
  floatingUiRefs: UseFloatingReturn['refs'];
  onClickOutside?: () => void;
  hotkeyScope: HotkeyScope;
  floatingStyles: UseFloatingReturn['floatingStyles'];
  hotkey?: {
    key: Keys;
    scope: string;
  };
  onHotkeyTriggered?: () => void;
  disableBlur?: boolean;
  dropdownMenuWidth?: `${string}px` | `${number}%` | 'auto' | number;
  dropdownComponents: React.ReactNode;
  parentDropdownId?: string;
};

export const DropdownContent = ({
  className,
  dropdownId,
  dropdownPlacement,
  floatingUiRefs,
  onClickOutside,
  hotkeyScope,
  floatingStyles,
  hotkey,
  onHotkeyTriggered,
  disableBlur,
  dropdownMenuWidth,
  dropdownComponents,
}: DropdownContentProps) => {
  const { isDropdownOpen, closeDropdown, dropdownWidth, setDropdownPlacement } =
    useDropdown(dropdownId);

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  const [dropdownMaxHeight] = useRecoilComponentStateV2(
    dropdownMaxHeightComponentStateV2,
    dropdownId,
  );

  useEffect(() => {
    setDropdownPlacement(dropdownPlacement);
  }, [dropdownPlacement, setDropdownPlacement]);

  useListenClickOutside({
    refs: [floatingUiRefs.floating, floatingUiRefs.domReference],
    listenerId: dropdownId,
    callback: (event) => {
      if (activeDropdownFocusId !== dropdownId) return;

      if (isDropdownOpen) {
        event.stopImmediatePropagation();
        event.preventDefault();

        closeDropdown();
      }

      onClickOutside?.();
    },
  });

  useInternalHotkeyScopeManagement({
    dropdownScopeId: getScopeIdFromComponentId(dropdownId),
    dropdownHotkeyScopeFromParent: hotkeyScope,
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      if (activeDropdownFocusId !== dropdownId) return;

      if (isDropdownOpen) {
        closeDropdown();
      }
    },
    hotkeyScope?.scope,
    [closeDropdown, isDropdownOpen],
  );

  const dropdownMenuStyles = {
    ...floatingStyles,
    maxHeight: dropdownMaxHeight,
  };

  return (
    <>
      {hotkey && onHotkeyTriggered && (
        <HotkeyEffect hotkey={hotkey} onHotkeyTriggered={onHotkeyTriggered} />
      )}
      <FloatingPortal>
        <DropdownMenu
          className={className}
          disableBlur={disableBlur}
          width={dropdownMenuWidth ?? dropdownWidth}
          data-select-disable
          ref={floatingUiRefs.setFloating}
          style={dropdownMenuStyles}
        >
          {dropdownComponents}
        </DropdownMenu>
      </FloatingPortal>
    </>
  );
};
