import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

type MultiItemInputKeyHandlers = {
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  preventTabNavigation?: boolean;
};

const getHandlerForKey = (
  event: KeyboardEvent<HTMLInputElement>,
  { onEnter, onEscape, onTab, onShiftTab }: MultiItemInputKeyHandlers,
) => {
  switch (event.key) {
    case Key.Enter:
      return onEnter;
    case Key.Escape:
      return onEscape;
    case Key.Tab:
      return event.shiftKey ? onShiftTab : onTab;
    default:
      return undefined;
  }
};

export const getMultiItemInputKeyDownHandler =
  (handlers: MultiItemInputKeyHandlers) =>
  (event: KeyboardEvent<HTMLInputElement>) => {
    const hasUnsupportedModifier =
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.shiftKey && event.key !== Key.Tab);

    if (isKeyboardEventComposing(event.nativeEvent) || hasUnsupportedModifier) {
      return;
    }

    if (event.key === Key.Tab && handlers.preventTabNavigation === true) {
      event.preventDefault();
    }

    const handler = getHandlerForKey(event, handlers);

    if (!isDefined(handler)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handler();
  };
