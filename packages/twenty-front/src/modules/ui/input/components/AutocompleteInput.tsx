import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { createElement } from 'react';
import {
  type AutocompleteInputProps,
  Autocomplete,
} from 'twenty-ui/primitives/input';

export const AutocompleteInput = ({
  onKeyDown,
  ...props
}: AutocompleteInputProps) => {
  const handleKeyDown: AutocompleteInputProps['onKeyDown'] = (event) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || isKeyboardEventComposing(event.nativeEvent)) {
      event.preventBaseUIHandler();
    }
  };

  return createElement(Autocomplete.Input, {
    ...props,
    onKeyDown: handleKeyDown,
  });
};
