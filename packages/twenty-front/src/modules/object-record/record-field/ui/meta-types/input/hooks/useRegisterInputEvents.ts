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
  shouldPropagateUnhandledEscape = false,
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
  shouldPropagateUnhandledEscape?: boolean;
}) => {
  useListenClickOutside({
    refs: [inputRef, copyRef].filter(isDefined),
    callback: (event) => {
      onClickOutside?.(event, inputValue);
    },
    listenerId: focusId,
    enabled: isDefined(onClickOutside),
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      onEnter?.(inputValue);
    },
    focusId,
    dependencies: [onEnter, inputValue],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      onEscape?.(inputValue);
    },
    focusId,
    dependencies: [onEscape, inputValue],
    options: {
      preventDefault: !shouldPropagateUnhandledEscape || isDefined(onEscape),
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Tab],
    callback: () => {
      onTab?.(inputValue);
    },
    focusId,
    dependencies: [onTab, inputValue],
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Shift}+${Key.Tab}`],
    callback: () => {
      onShiftTab?.(inputValue);
    },
    focusId,
    dependencies: [onShiftTab, inputValue],
  });
};
