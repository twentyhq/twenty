import { FocusEventHandler, useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import {
  TextInputV2,
  TextInputV2ComponentProps,
} from '@/ui/input/components/TextInputV2';
import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from 'twenty-shared/utils';

export type TextInputProps = TextInputV2ComponentProps & {
  disableHotkeys?: boolean;
  onInputEnter?: () => void;
  dataTestId?: string;
  autoFocusOnMount?: boolean;
  autoSelectOnMount?: boolean;
};

export const TextInput = ({
  onFocus,
  onBlur,
  onInputEnter,
  disableHotkeys = false,
  autoFocusOnMount,
  autoSelectOnMount,
  dataTestId,
  ...props
}: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocusOnMount === true) {
      inputRef.current?.focus();
      setIsFocused(true);
    }
  }, [autoFocusOnMount]);

  useEffect(() => {
    if (autoSelectOnMount === true) {
      inputRef.current?.select();
    }
  }, [autoSelectOnMount]);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    onFocus?.(e);
    setIsFocused(true);

    if (!disableHotkeys) {
      setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e);
    setIsFocused(false);

    if (!disableHotkeys) {
      goBackToPreviousHotkeyScope();
    }
  };

  useScopedHotkeys(
    [Key.Escape],
    () => {
      if (!isFocused) {
        return;
      }

      if (isDefined(inputRef) && 'current' in inputRef) {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    },
    InputHotkeyScope.TextInput,
    [inputRef, isFocused],
    {
      preventDefault: false,
    },
  );

  useScopedHotkeys(
    [Key.Enter],
    () => {
      if (!isFocused) {
        return;
      }

      onInputEnter?.();

      if (isDefined(inputRef) && 'current' in inputRef) {
        setIsFocused(false);
      }
    },
    InputHotkeyScope.TextInput,
    [inputRef, isFocused, onInputEnter],
    {
      preventDefault: false,
    },
  );

  return (
    <TextInputV2
      ref={inputRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      dataTestId={dataTestId}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};
