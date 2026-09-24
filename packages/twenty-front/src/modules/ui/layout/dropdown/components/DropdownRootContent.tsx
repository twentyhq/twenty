import { styled } from '@linaria/react';
import { type ComponentProps, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';

import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';

const StyledClickOutsideListenerExclusion = styled.div`
  display: contents;
`;

type DropdownRootContentProps = Pick<
  ComponentProps<typeof Dropdown.Content>,
  'children' | 'side' | 'align' | 'sideOffset' | 'width'
>;

export const DropdownRootContent = ({
  children,
  side,
  align,
  sideOffset,
  width,
}: DropdownRootContentProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);

  return (
    <Dropdown.Content
      data-click-outside-id={parentClickOutsideId}
      side={side}
      align={align}
      sideOffset={sideOffset}
      width={width}
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
