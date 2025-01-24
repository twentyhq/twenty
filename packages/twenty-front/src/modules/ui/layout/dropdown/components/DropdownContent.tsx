import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useInternalHotkeyScopeManagement } from '@/ui/layout/dropdown/hooks/useInternalHotkeyScopeManagement';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { dropdownMaxHeightComponentStateV2 } from '@/ui/layout/dropdown/states/dropdownMaxHeightComponentStateV2';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import {
  FloatingPortal,
  Placement,
  UseFloatingReturn,
} from '@floating-ui/react';
import { useEffect } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

export const StyledDropdownContentContainer = styled.div`
  display: flex;
  z-index: 30;
`;

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
  dropdownMenuWidth?: `${string}px` | `${number}%` | 'auto' | number;
  dropdownComponents: React.ReactNode;
  parentDropdownId?: string;
  avoidPortal?: boolean;
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
  dropdownMenuWidth,
  dropdownComponents,
  avoidPortal,
}: DropdownContentProps) => {
  const { isDropdownOpen, closeDropdown, dropdownWidth, setDropdownPlacement } =
    useDropdown(dropdownId);

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  const dropdownMaxHeight = useRecoilComponentValueV2(
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
      {avoidPortal ? (
        <StyledDropdownContentContainer
          ref={floatingUiRefs.setFloating}
          style={dropdownMenuStyles}
          role="listbox"
          id={`${dropdownId}-options`}
        >
          <OverlayContainer>
            <DropdownMenu
              className={className}
              width={dropdownMenuWidth ?? dropdownWidth}
              data-select-disable
            >
              {dropdownComponents}
            </DropdownMenu>
          </OverlayContainer>
        </StyledDropdownContentContainer>
      ) : (
        <FloatingPortal>
          <StyledDropdownContentContainer
            ref={floatingUiRefs.setFloating}
            style={dropdownMenuStyles}
            role="listbox"
            id={`${dropdownId}-options`}
          >
            <OverlayContainer>
              <DropdownMenu
                id={dropdownId}
                className={className}
                width={dropdownMenuWidth ?? dropdownWidth}
                data-select-disable
              >
                {dropdownComponents}
              </DropdownMenu>
            </OverlayContainer>
          </StyledDropdownContentContainer>
        </FloatingPortal>
      )}
    </>
  );
};
