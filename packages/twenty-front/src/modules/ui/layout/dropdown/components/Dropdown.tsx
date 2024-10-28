import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  Placement,
  useFloating,
} from '@floating-ui/react';
import { MouseEvent, useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { isDefined } from '~/utils/isDefined';

import { useDropdown } from '../hooks/useDropdown';
import { useInternalHotkeyScopeManagement } from '../hooks/useInternalHotkeyScopeManagement';

import { DropdownMenu } from './DropdownMenu';
import { DropdownOnToggleEffect } from './DropdownOnToggleEffect';

type DropdownProps = {
  className?: string;
  clickableComponent?: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope: HotkeyScope;
  dropdownId: string;
  dropdownPlacement?: Placement;
  dropdownMenuWidth?: `${string}px` | `${number}%` | 'auto' | number;
  dropdownOffset?: { x?: number; y?: number };
  dropdownStrategy?: 'fixed' | 'absolute';
  disableBlur?: boolean;
  onClickOutside?: () => void;
  usePortal?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
};

export const Dropdown = ({
  className,
  clickableComponent,
  dropdownComponents,
  dropdownMenuWidth,
  hotkey,
  dropdownId,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  dropdownStrategy = 'absolute',
  dropdownOffset = { x: 0, y: 0 },
  disableBlur = false,
  usePortal = false,
  onClickOutside,
  onClose,
  onOpen,
}: DropdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownOpen, toggleDropdown, closeDropdown, dropdownWidth } =
    useDropdown(dropdownId);

  const offsetMiddlewares = [];

  if (isDefined(dropdownOffset.x)) {
    offsetMiddlewares.push(offset({ crossAxis: dropdownOffset.x }));
  }

  if (isDefined(dropdownOffset.y)) {
    offsetMiddlewares.push(offset({ mainAxis: dropdownOffset.y }));
  }

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [flip(), ...offsetMiddlewares],
    whileElementsMounted: autoUpdate,
    strategy: dropdownStrategy,
  });

  const handleHotkeyTriggered = () => {
    toggleDropdown();
  };

  const handleClickableComponentClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    toggleDropdown();
    onClickOutside?.();
  };

  useListenClickOutside({
    refs: [refs.floating],
    callback: () => {
      onClickOutside?.();

      if (isDropdownOpen) {
        closeDropdown();
      }
    },
  });

  useInternalHotkeyScopeManagement({
    dropdownScopeId: getScopeIdFromComponentId(dropdownId),
    dropdownHotkeyScopeFromParent: dropdownHotkeyScope,
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    dropdownHotkeyScope.scope,
    [closeDropdown],
  );

  return (
    <DropdownScope dropdownScopeId={getScopeIdFromComponentId(dropdownId)}>
      <div ref={containerRef} className={className}>
        {clickableComponent && (
          <div
            ref={refs.setReference}
            onClick={handleClickableComponentClick}
            className={className}
          >
            {clickableComponent}
          </div>
        )}
        {hotkey && (
          <HotkeyEffect
            hotkey={hotkey}
            onHotkeyTriggered={handleHotkeyTriggered}
          />
        )}
        {isDropdownOpen && usePortal && (
          <FloatingPortal>
            <DropdownMenu
              disableBlur={disableBlur}
              width={dropdownMenuWidth ?? dropdownWidth}
              data-select-disable
              ref={refs.setFloating}
              style={floatingStyles}
            >
              {dropdownComponents}
            </DropdownMenu>
          </FloatingPortal>
        )}
        {isDropdownOpen && !usePortal && (
          <DropdownMenu
            disableBlur={disableBlur}
            width={dropdownMenuWidth ?? dropdownWidth}
            data-select-disable
            ref={refs.setFloating}
            style={floatingStyles}
          >
            {dropdownComponents}
          </DropdownMenu>
        )}
        <DropdownOnToggleEffect
          onDropdownClose={onClose}
          onDropdownOpen={onOpen}
        />
      </div>
    </DropdownScope>
  );
};
