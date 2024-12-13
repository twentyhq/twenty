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
import { dropdownHeightComponentStateV2 } from '@/ui/layout/dropdown/states/dropdownHeightComponentStateV2';
import { dropdownMaxHeightComponentStateV2 } from '@/ui/layout/dropdown/states/dropdownMaxHeightComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { flushSync } from 'react-dom';
import { useRecoilCallback } from 'recoil';
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
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  avoidPortal?: boolean;
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
  onClickOutside,
  onClose,
  onOpen,
  avoidPortal,
}: DropdownProps) => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(dropdownId);

  const offsetMiddlewares = [];

  const setDropdownMaxHeight = useSetRecoilComponentStateV2(
    dropdownMaxHeightComponentStateV2,
    dropdownId,
  );

  const setDropdownHeight = useSetRecoilComponentStateV2(
    dropdownHeightComponentStateV2,
    dropdownId,
  );

  if (isDefined(dropdownOffset.x)) {
    offsetMiddlewares.push(offset({ crossAxis: dropdownOffset.x }));
  }

  if (isDefined(dropdownOffset.y)) {
    offsetMiddlewares.push(offset({ mainAxis: dropdownOffset.y }));
  }

  const process = useRecoilCallback(
    ({ snapshot, set }) =>
      (availableHeight: any, elements: any) => {
        flushSync(() => {
          const elementRect = elements.floating.getBoundingClientRect();

          const dropdownHeight = elementRect.height;
          const childRect =
            elements.floating.firstElementChild?.getBoundingClientRect();

          const dropdownContentHeight = childRect?.height ?? 0;

          const actualHeight = snapshot
            .getLoadable(
              dropdownHeightComponentStateV2.atomFamily({
                instanceId: dropdownId,
              }),
            )
            .getValue();

          console.log({
            dropdownHeight,
            dropdownContentHeight,
            actualHeight,
          });

          // if (dropdownHeight > dropdownContentHeight) {
          //   if (actualHeight !== '100%') {
          //     setDropdownHeight('100%');
          //   }
          // } else {
          //   if (actualHeight !== 'fit-content') {
          //     setDropdownHeight('fit-content');
          //   }
          // }

          setDropdownMaxHeight(availableHeight);
        });
      },
    [],
  );

  const { refs, floatingStyles, placement } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      flip(),
      size({
        padding: 32,
        apply: ({ availableHeight, elements }) => {
          process(availableHeight, elements);
          // flushSync(() => {
          //   const elementRect = elements.floating.getBoundingClientRect();

          //   const dropdownHeight = elementRect.height;
          //   const childRect =
          //     elements.floating.firstElementChild?.getBoundingClientRect();

          //   const dropdownContentHeight = childRect?.height ?? 0;

          //   if (dropdownHeight > dropdownContentHeight) {
          //     setDropdownHeight('fit-content');
          //   } else {
          //     setDropdownHeight('100%');
          //   }

          //   setDropdownMaxHeight(availableHeight);
          // });
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
              dropdownMenuWidth={dropdownMenuWidth}
              dropdownComponents={dropdownComponents}
              dropdownId={dropdownId}
              dropdownPlacement={placement ?? 'bottom-end'}
              floatingUiRefs={refs}
              hotkeyScope={dropdownHotkeyScope}
              hotkey={hotkey}
              onClickOutside={onClickOutside}
              onHotkeyTriggered={toggleDropdown}
              avoidPortal={avoidPortal}
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
