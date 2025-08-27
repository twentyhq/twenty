import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { dropdownMaxHeightComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxHeightComponentState';
import { dropdownMaxWidthComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxWidthComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import {
  FloatingPortal,
  type Placement,
  type UseFloatingReturn,
} from '@floating-ui/react';
import { useContext, useEffect } from 'react';
import { type Keys } from 'react-hotkeys-hook';
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
  floatingStyles: UseFloatingReturn['floatingStyles'];
  hotkey?: {
    key: Keys;
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
  const isDropdownOpen = useRecoilComponentValue(isDropdownOpenComponentState);

  const { closeDropdown } = useCloseDropdown();

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  const dropdownMaxHeight = useRecoilComponentValue(
    dropdownMaxHeightComponentState,
    dropdownId,
  );

  const dropdownMaxWidth = useRecoilComponentValue(
    dropdownMaxWidthComponentState,
    dropdownId,
  );

  const setDropdownPlacement = useSetRecoilComponentState(
    dropdownPlacementComponentState,
    dropdownId,
  );

  // TODO: remove this useEffect
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

        closeDropdown(dropdownId);
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
        closeDropdown(dropdownId);
      }
    },
    focusId: dropdownId,
    dependencies: [
      closeDropdown,
      isDropdownOpen,
      activeDropdownFocusId,
      dropdownId,
    ],
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
        <HotkeyEffect
          hotkey={hotkey}
          onHotkeyTriggered={onHotkeyTriggered}
          focusId={dropdownId}
        />
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
