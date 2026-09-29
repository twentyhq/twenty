import { styled } from '@linaria/react';
import { type ComponentProps, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';

import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';

const StyledClickOutsideListenerExclusion = styled.div`
  display: contents;
`;

type DropdownContentProps = Pick<
  ComponentProps<typeof Dropdown.Content>,
  | 'children'
  | 'side'
  | 'align'
  | 'sideOffset'
  | 'alignOffset'
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
  width,
  initialFocus,
  finalFocus,
  className,
  'aria-label': ariaLabel,
  ref,
}: DropdownContentProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);

  return (
    <Dropdown.Content
      ref={ref}
      data-click-outside-id={parentClickOutsideId}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      width={width}
      initialFocus={initialFocus}
      finalFocus={finalFocus}
      className={className}
      aria-label={ariaLabel}
    >
      {isDefined(excludedClickOutsideId) ? (
        <StyledClickOutsideListenerExclusion
          data-click-outside-id={excludedClickOutsideId}
        >
          {children}
        </StyledClickOutsideListenerExclusion>
      ) : (
        children
      )}
    </Dropdown.Content>
  );
};
