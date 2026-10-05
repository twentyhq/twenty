import { type ComponentProps, useContext } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { DropdownClickOutsideListenerExclusion } from '@/ui/layout/dropdown/components/DropdownClickOutsideListenerExclusion';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';

type DropdownContentProps = Pick<
  ComponentProps<typeof Dropdown.Content>,
  | 'children'
  | 'side'
  | 'align'
  | 'sideOffset'
  | 'alignOffset'
  | 'anchor'
  | 'collisionPadding'
  | 'width'
  | 'initialFocus'
  | 'finalFocus'
  | 'className'
  | 'aria-label'
  | 'ref'
>;

export const DropdownContent = ({
  children,
  side,
  align,
  sideOffset,
  alignOffset,
  anchor,
  collisionPadding,
  width,
  initialFocus,
  finalFocus,
  className,
  'aria-label': ariaLabel,
  ref,
}: DropdownContentProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  return (
    <Dropdown.Content
      ref={ref}
      data-click-outside-id={parentClickOutsideId}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      anchor={anchor}
      collisionPadding={collisionPadding}
      width={width}
      initialFocus={initialFocus}
      finalFocus={finalFocus}
      className={className}
      aria-label={ariaLabel}
    >
      <DropdownClickOutsideListenerExclusion>
        {children}
      </DropdownClickOutsideListenerExclusion>
    </Dropdown.Content>
  );
};
