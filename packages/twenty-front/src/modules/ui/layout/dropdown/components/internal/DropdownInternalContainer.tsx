import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { dropdownMaxHeightComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxHeightComponentState';
import { dropdownMaxWidthComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxWidthComponentState';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import {
  FloatingPortal,
  Placement,
  UseFloatingReturn,
} from '@floating-ui/react';
import { useContext, useEffect } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

export const StyledDropdownContentContainer = styled.div<{
  isDropdownInModal?: boolean;
}>`
  display: flex;
  z-index: ${({ isDropdownInModal }) =>
    isDropdownInModal
      ? RootStackingContextZIndices.DropdownPortalAboveModal
      : RootStackingContextZIndices.DropdownPortalBelowModal};
`;

const StyledDropdownInsideContainer = styled.div`
  display: flex;

  flex-direction: column;
  height: 100%;
  width: 100%;
`;

export type DropdownInternalContainerProps = {
  dropdownId: string;
  dropdownPlacement: Placement;
  floatingUiRefs: UseFloatingReturn['refs'];
  onClickOutside?: () => void;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
  floatingStyles: UseFloatingReturn['floatingStyles'];
  hotkey?: {
    key: Keys;
    scope: string;
  };
  onHotkeyTriggered?: () => void;
  dropdownComponents: React.ReactNode;
  parentDropdownId?: string;
  excludedClickOutsideIds?: string[];
  isDropdownInModal?: boolean;
};

export const DropdownInternalContainer = ({
  dropdownId,
  dropdownPlacement,
  floatingUiRefs,
  onClickOutside,
  floatingStyles,
  hotkey,
  onHotkeyTriggered,
  dropdownComponents,
  excludedClickOutsideIds,
  isDropdownInModal = false,
}: DropdownInternalContainerProps) => {
  const { isDropdownOpen, closeDropdown, setDropdownPlacement } =
    useDropdown(dropdownId);

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  const dropdownMaxHeight = useRecoilComponentValueV2(
    dropdownMaxHeightComponentState,
    dropdownId,
  );

  const dropdownMaxWidth = useRecoilComponentValueV2(
    dropdownMaxWidthComponentState,
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
    excludedClickOutsideIds,
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      if (activeDropdownFocusId !== dropdownId) return;

      if (isDropdownOpen) {
        closeDropdown();
      }
    },
    focusId: dropdownId,
    scope: 'dropdown',
    dependencies: [closeDropdown, isDropdownOpen, activeDropdownFocusId],
  });

  const dropdownMenuStyles = {
    ...floatingStyles,
    maxHeight: dropdownMaxHeight,
    maxWidth: dropdownMaxWidth,
  };

  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);

  return (
    <>
      {hotkey && onHotkeyTriggered && (
        <HotkeyEffect hotkey={hotkey} onHotkeyTriggered={onHotkeyTriggered} />
      )}

      <FloatingPortal>
        <StyledDropdownContentContainer
          ref={floatingUiRefs.setFloating}
          style={dropdownMenuStyles}
          role="listbox"
          id={`${dropdownId}-options`}
          data-click-outside-id={excludedClickOutsideId}
          isDropdownInModal={isDropdownInModal}
        >
          <OverlayContainer>
            <StyledDropdownInsideContainer id={dropdownId} data-select-disable>
              {dropdownComponents}
            </StyledDropdownInsideContainer>
          </OverlayContainer>
        </StyledDropdownContentContainer>
      </FloatingPortal>
    </>
  );
};
