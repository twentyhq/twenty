import { styled } from '@linaria/react';
import { type ComponentProps, type MouseEvent, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Autocomplete } from 'twenty-ui/primitives/input';

import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';

const StyledClickOutsideListenerExclusion = styled.div`
  display: contents;
`;

type AutocompleteContentProps = Pick<
  ComponentProps<typeof Autocomplete.Popup>,
  'children' | 'align' | 'sideOffset' | 'width'
>;

export const AutocompleteContent = ({
  children,
  align,
  sideOffset,
  width,
}: AutocompleteContentProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);

  const keepFocusInInput = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Autocomplete.Popup
      data-click-outside-id={parentClickOutsideId}
      align={align}
      sideOffset={sideOffset}
      width={width}
      onMouseDown={keepFocusInInput}
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
    </Autocomplete.Popup>
  );
};
