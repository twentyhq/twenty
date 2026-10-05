import { type ComponentProps, type MouseEvent, useContext } from 'react';
import { Autocomplete } from 'twenty-ui/primitives/input';

import { DropdownClickOutsideListenerExclusion } from '@/ui/layout/dropdown/components/DropdownClickOutsideListenerExclusion';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';

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
      <DropdownClickOutsideListenerExclusion>
        {children}
      </DropdownClickOutsideListenerExclusion>
    </Autocomplete.Popup>
  );
};
