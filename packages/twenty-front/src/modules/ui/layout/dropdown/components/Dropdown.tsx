import { DropdownOnToggleEffect } from '@/ui/layout/dropdown/components/DropdownOnToggleEffect';
import { DropdownInternalContainer } from '@/ui/layout/dropdown/components/internal/DropdownInternalContainer';
import { DROPDOWN_BOUNDARY_BOTTOM_PADDING_DESKTOP } from '@/ui/layout/dropdown/constants/DropdownBoundaryBottomPaddingDesktop';
import { DROPDOWN_BOUNDARY_BOTTOM_PADDING_MOBILE } from '@/ui/layout/dropdown/constants/DropdownBoundaryBottomPaddingMobile';
import { DROPDOWN_BOUNDARY_HORIZONTAL_PADDING } from '@/ui/layout/dropdown/constants/DropdownBoundaryHorizontalPadding';
import { DROPDOWN_RESIZE_MIN_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownResizeMinHeight';
import { DROPDOWN_RESIZE_MIN_WIDTH } from '@/ui/layout/dropdown/constants/DropdownResizeMinWidth';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { dropdownMaxHeightComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxHeightComponentState';
import { dropdownMaxWidthComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxWidthComponentState';
import { dropdownYPositionComponentState } from '@/ui/layout/dropdown/states/internal/dropdownYPositionComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import {
  type Placement,
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import { styled } from '@linaria/react';
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
} from 'react';
import { flushSync } from 'react-dom';
import { type Keys } from 'react-hotkeys-hook';
import { isDefined } from 'twenty-shared/utils';
import { handleClickableElementKeyDown } from 'twenty-ui/primitives/accessibility';
import { useIsMobile } from 'twenty-ui/utilities';

type Width = `${string}px` | `${number}%` | 'auto' | number;
const StyledDropdownFallbackAnchor = styled.div`
  left: 0;
  position: fixed;
  top: 0;
`;

const StyledClickableComponent = styled.div<{
  width?: Width;
}>`
  height: fit-content;
  width: ${({ width }) => width ?? 'auto'};
`;

export type DropdownProps = {
  clickableComponent?: ReactNode;
  clickableComponentWidth?: Width;
  clickableComponentTabIndex?: number;
  dropdownComponents: ReactNode;
  hotkey?: {
    key: Keys;
  };
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
  dropdownId: string;
  dropdownPlacement?: Placement;
  positionReference?: HTMLElement | null;
  dropdownOffset?: DropdownOffset;
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  excludedClickOutsideIds?: string[];
  isDropdownInModal?: boolean;
  disableClickForClickableComponent?: boolean;
  middlewareBoundaryPadding?: {
    right?: number;
    left?: number;
    bottomDesktop?: number;
    bottomMobile?: number;
  };
};

export const Dropdown = ({
  clickableComponent,
  dropdownComponents,
  hotkey,
  dropdownId,
  globalHotkeysConfig,
  dropdownPlacement = 'bottom-end',
  positionReference,
  dropdownOffset,
  onClickOutside,
  onClose,
  onOpen,
  clickableComponentWidth = 'auto',
  clickableComponentTabIndex,
  excludedClickOutsideIds,
  isDropdownInModal = false,
  disableClickForClickableComponent = false,
  middlewareBoundaryPadding = {},
}: DropdownProps) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { toggleDropdown } = useToggleDropdown();
  const { closeDropdown } = useCloseDropdown();

  const isUsingOffset =
    isDefined(dropdownOffset?.x) || isDefined(dropdownOffset?.y);

  const offsetMiddleware = isUsingOffset
    ? [
        offset({
          crossAxis: dropdownOffset?.x ?? 0,
          mainAxis: dropdownOffset?.y ?? 0,
        }),
      ]
    : [];

  const setDropdownMaxHeight = useSetAtomComponentState(
    dropdownMaxHeightComponentState,
    dropdownId,
  );

  const setDropdownMaxWidth = useSetAtomComponentState(
    dropdownMaxWidthComponentState,
    dropdownId,
  );

  const setDropdownYPosition = useSetAtomComponentState(
    dropdownYPositionComponentState,
    dropdownId,
  );

  const isMobile = useIsMobile();
  const bottomAutoresizePadding = isMobile
    ? (middlewareBoundaryPadding.bottomMobile ??
      DROPDOWN_BOUNDARY_BOTTOM_PADDING_MOBILE)
    : (middlewareBoundaryPadding.bottomDesktop ??
      DROPDOWN_BOUNDARY_BOTTOM_PADDING_DESKTOP);

  const boundaryOptions = {
    boundary: document.querySelector('#root') ?? undefined,
    padding: {
      right:
        middlewareBoundaryPadding.right ?? DROPDOWN_BOUNDARY_HORIZONTAL_PADDING,
      left:
        middlewareBoundaryPadding.left ?? DROPDOWN_BOUNDARY_HORIZONTAL_PADDING,
      bottom: bottomAutoresizePadding,
    },
  };

  const { refs, floatingStyles, placement, context } = useFloating({
    open: isDropdownOpen,
    onOpenChange: (open) => {
      if (!open) {
        closeDropdown(dropdownId);
      }
    },
    placement: dropdownPlacement,
    middleware: [
      ...offsetMiddleware,
      flip({
        ...boundaryOptions,
      }),
      size({
        apply: ({ availableHeight, availableWidth, y: floatingY }) => {
          flushSync(() => {
            const maxHeightToApply =
              availableHeight < DROPDOWN_RESIZE_MIN_HEIGHT
                ? DROPDOWN_RESIZE_MIN_HEIGHT
                : availableHeight;

            const maxWidthToApply =
              availableWidth < DROPDOWN_RESIZE_MIN_WIDTH
                ? DROPDOWN_RESIZE_MIN_WIDTH
                : availableWidth;

            setDropdownMaxHeight(maxHeightToApply);
            setDropdownMaxWidth(maxWidthToApply);
            setDropdownYPosition(floatingY);
          });
        },
        ...boundaryOptions,
      }),
    ],
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  });

  useLayoutEffect(() => {
    if (!isDefined(positionReference)) {
      return;
    }
    // Keep the original trigger for click-outside handling.
    const trigger = refs.domReference.current;
    refs.setPositionReference(positionReference);
    return () => refs.setPositionReference(trigger);
  }, [positionReference, refs]);

  const handleClickableComponentClick = useCallback(
    async (event: MouseEvent) => {
      if (disableClickForClickableComponent) return;
      event.stopPropagation();
      event.preventDefault();

      toggleDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
        globalHotkeysConfig,
      });
    },
    [
      globalHotkeysConfig,
      toggleDropdown,
      dropdownId,
      disableClickForClickableComponent,
    ],
  );

  const handleClickableComponentKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      !isDefined(clickableComponentTabIndex) ||
      event.target !== event.currentTarget ||
      (event.key !== 'Enter' && event.key !== ' ')
    ) {
      return;
    }

    if (isDropdownOpen) {
      if (event.key === ' ') {
        event.preventDefault();
      }

      return;
    }

    event.stopPropagation();
    handleClickableElementKeyDown(event);
  };

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      {isDefined(clickableComponent) ? (
        <StyledClickableComponent
          ref={refs.setReference}
          onClick={handleClickableComponentClick}
          tabIndex={clickableComponentTabIndex}
          onKeyDown={handleClickableComponentKeyDown}
          aria-controls={`${dropdownId}-options`}
          aria-expanded={isDropdownOpen}
          aria-haspopup={true}
          role="button"
          width={clickableComponentWidth}
        >
          {clickableComponent}
        </StyledClickableComponent>
      ) : (
        <StyledDropdownFallbackAnchor ref={refs.setReference} />
      )}
      {isDropdownOpen && (
        <DropdownInternalContainer
          floatingStyles={floatingStyles}
          floatingContext={context}
          manageFocus={isDefined(clickableComponentTabIndex)}
          dropdownComponents={dropdownComponents}
          dropdownId={dropdownId}
          dropdownPlacement={placement}
          floatingUiRefs={refs}
          hotkey={hotkey}
          onClickOutside={onClickOutside}
          onHotkeyTriggered={onOpen}
          excludedClickOutsideIds={excludedClickOutsideIds}
          isDropdownInModal={isDropdownInModal}
        />
      )}
      <DropdownOnToggleEffect
        onDropdownClose={onClose}
        onDropdownOpen={onOpen}
      />
    </DropdownComponentInstanceContext.Provider>
  );
};
