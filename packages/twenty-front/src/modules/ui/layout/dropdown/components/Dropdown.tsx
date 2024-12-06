import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import {
  autoUpdate,
  flip,
  offset,
  Placement,
  size,
  useFloating,
} from '@floating-ui/react';
import { MouseEvent, ReactNode } from 'react';
import { Keys } from 'react-hotkeys-hook';

import { useDropdown } from '../hooks/useDropdown';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownUnmountEffect } from '@/ui/layout/dropdown/components/DropdownUnmountEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { dropdownMaxHeightComponentStateV2 } from '@/ui/layout/dropdown/states/dropdownMaxHeightComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-ui';
import { DropdownOnToggleEffect } from './DropdownOnToggleEffect';

type DropdownProps = {
  className?: string;
  clickableComponent?: ReactNode;
  dropdownComponents: ReactNode;
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
  onClickOutside,
  onClose,
  onOpen,
}: DropdownProps) => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(dropdownId);

  const offsetMiddlewares = [];

  const setDropdownMaxHeight = useSetRecoilComponentStateV2(
    dropdownMaxHeightComponentStateV2,
    dropdownId,
  );

  if (isDefined(dropdownOffset.x)) {
    offsetMiddlewares.push(offset({ crossAxis: dropdownOffset.x }));
  }

  if (isDefined(dropdownOffset.y)) {
    offsetMiddlewares.push(offset({ mainAxis: dropdownOffset.y }));
  }

  const { refs, floatingStyles, placement } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      flip(),
      size({
        padding: 32,
        apply: ({ availableHeight }) => {
          flushSync(() => {
            setDropdownMaxHeight(availableHeight);
          });
        },
        boundary: document.querySelector('#root') ?? undefined,
      }),
      ...offsetMiddlewares,
    ],
    whileElementsMounted: autoUpdate,
    strategy: dropdownStrategy,
  });

  const handleClickableComponentClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    toggleDropdown();
    onClickOutside?.();
  };

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <DropdownScope dropdownScopeId={getScopeIdFromComponentId(dropdownId)}>
        <>
          {clickableComponent && (
            <div
              ref={refs.setReference}
              onClick={handleClickableComponentClick}
            >
              {clickableComponent}
            </div>
          )}
          {isDropdownOpen && (
            <DropdownContent
              className={className}
              floatingStyles={floatingStyles}
              disableBlur={disableBlur}
              dropdownMenuWidth={dropdownMenuWidth}
              dropdownComponents={dropdownComponents}
              dropdownId={dropdownId}
              dropdownPlacement={placement ?? 'bottom-end'}
              floatingUiRefs={refs}
              hotkeyScope={dropdownHotkeyScope}
              hotkey={hotkey}
              onClickOutside={onClickOutside}
              onHotkeyTriggered={toggleDropdown}
            />
          )}
          <DropdownOnToggleEffect
            onDropdownClose={onClose}
            onDropdownOpen={onOpen}
          />
        </>
      </DropdownScope>
      <DropdownUnmountEffect dropdownId={dropdownId} />
    </DropdownComponentInstanceContext.Provider>
  );
};
