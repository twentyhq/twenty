import { FocusEventHandler, forwardRef, useRef } from 'react';
import { Key } from 'ts-key-enum';

import {
  TextInputV2,
  TextInputV2ComponentProps,
} from '@/ui/input/components/TextInputV2';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { InputHotkeyScope } from '../types/InputHotkeyScope';

export type TextInputComponentProps = TextInputV2ComponentProps & {
  disableHotkeys?: boolean;
};

const TextInputComponent = ({
  onFocus,
  onBlur,
  disableHotkeys = false,
  ...props
}: TextInputComponentProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    onFocus?.(e);

    if (!disableHotkeys) {
      setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e);

    if (!disableHotkeys) {
      goBackToPreviousHotkeyScope();
    }
  };

  useScopedHotkeys(
    [Key.Escape, Key.Enter],
    () => {
      inputRef.current?.blur();
    },
    InputHotkeyScope.TextInput,
    { enabled: !disableHotkeys },
  );

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <TextInputV2 {...props} onFocus={handleFocus} onBlur={handleBlur} />;
};

export const TextInput = forwardRef(TextInputComponent);
