import { FocusEventHandler, forwardRef, ForwardRefRenderFunction } from 'react';
import { Key } from 'ts-key-enum';

import {
  TextInputV2,
  TextInputV2ComponentProps,
} from '@/ui/input/components/TextInputV2';
import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from '~/utils/isDefined';

export type TextInputComponentProps = TextInputV2ComponentProps & {
  disableHotkeys?: boolean;
};

const TextInputComponent: ForwardRefRenderFunction<
  HTMLInputElement,
  TextInputComponentProps
> = ({ onFocus, onBlur, disableHotkeys = false, ...props }, ref) => {
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
      if (isDefined(ref) && 'current' in ref) {
        ref.current?.blur();
      }
    },
    InputHotkeyScope.TextInput,
    { enabled: !disableHotkeys },
  );

  return (
    <TextInputV2
      ref={ref}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export const TextInput = forwardRef(TextInputComponent);
