import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

type MultiItemInputKeyHandlers = {
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  shouldPreventTabNavigation?: boolean;
};

export const getMultiItemInputKeyDownHandler =
  ({
    onEnter,
    onEscape,
    onTab,
    onShiftTab,
    shouldPreventTabNavigation,
  }: MultiItemInputKeyHandlers) =>
  (event: KeyboardEvent<HTMLInputElement>) => {
    const hasUnsupportedModifier =
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.shiftKey && event.key !== Key.Tab);

    if (isKeyboardEventComposing(event.nativeEvent) || hasUnsupportedModifier) {
      return;
    }

    if (event.key === Key.Tab && shouldPreventTabNavigation) {
      event.preventDefault();
    }

    const handlersByKey: Partial<Record<string, () => void>> = {
      [Key.Enter]: onEnter,
      [Key.Escape]: onEscape,
      [Key.Tab]: event.shiftKey ? onShiftTab : onTab,
    };

    const handler = handlersByKey[event.key];

    if (!isDefined(handler)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handler();
  };
