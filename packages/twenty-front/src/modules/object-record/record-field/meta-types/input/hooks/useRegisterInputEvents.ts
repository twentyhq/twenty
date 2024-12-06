import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

export const useRegisterInputEvents = <T>({
  inputRef,
  copyRef,
  inputValue,
  onEscape,
  onEnter,
  onTab,
  onShiftTab,
  onClickOutside,
  hotkeyScope,
}: {
  inputRef: React.RefObject<any>;
  copyRef?: React.RefObject<any>;
  inputValue: T;
  onEscape?: (inputValue: T) => void;
  onEnter?: (inputValue: T) => void;
  onTab?: (inputValue: T) => void;
  onShiftTab?: (inputValue: T) => void;
  onClickOutside?: (event: MouseEvent | TouchEvent, inputValue: T) => void;
  hotkeyScope: string;
}) => {
  useListenClickOutside({
    refs: [inputRef, copyRef].filter(isDefined),
    callback: (event) => {
      onClickOutside?.(event, inputValue);
    },
    enabled: isDefined(onClickOutside),
    listenerId: hotkeyScope,
  });

  useScopedHotkeys(
    'enter',
    () => {
      onEnter?.(inputValue);
    },
    hotkeyScope,
    [onEnter, inputValue],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onEscape?.(inputValue);
    },
    hotkeyScope,
    [onEscape, inputValue],
  );

  useScopedHotkeys(
    'tab',
    () => {
      onTab?.(inputValue);
    },
    hotkeyScope,
    [onTab, inputValue],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      onShiftTab?.(inputValue);
    },
    hotkeyScope,
    [onShiftTab, inputValue],
  );
};
