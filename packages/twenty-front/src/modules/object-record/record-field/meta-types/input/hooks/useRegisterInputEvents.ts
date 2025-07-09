import { Key } from 'ts-key-enum';

import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';

export const useRegisterInputEvents = <T>({
  inputRef,
  copyRef,
  inputValue,
  onEscape,
  onEnter,
  onTab,
  onShiftTab,
  onClickOutside,
  focusId,
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
  focusId: string;
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

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      onEnter?.(inputValue);
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [onEnter, inputValue],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      onEscape?.(inputValue);
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [onEscape, inputValue],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Tab],
    callback: () => {
      onTab?.(inputValue);
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [onTab, inputValue],
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Shift}+${Key.Tab}`],
    callback: () => {
      onShiftTab?.(inputValue);
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [onShiftTab, inputValue],
  });
};
