import { FocusEventHandler, useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import {
  TextInputV2,
  TextInputV2ComponentProps,
} from '@/ui/input/components/TextInputV2';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { isDefined } from 'twenty-shared/utils';

export type TextInputProps = TextInputV2ComponentProps & {
  instanceId: string;
  disableHotkeys?: boolean;
  onInputEnter?: () => void;
  dataTestId?: string;
  autoFocusOnMount?: boolean;
  autoSelectOnMount?: boolean;
};

export const TextInput = ({
  instanceId,
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

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    onFocus?.(e);
    setIsFocused(true);

    if (!disableHotkeys) {
      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.TEXT_INPUT,
          instanceId: instanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e);
    setIsFocused(false);

    if (!disableHotkeys) {
      removeFocusItemFromFocusStackById({ focusId: instanceId });
    }
  };

  const handleEscape = () => {
    if (!isFocused) {
      return;
    }
    if (isDefined(inputRef) && 'current' in inputRef) {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  const handleEnter = () => {
    if (!isFocused) {
      return;
    }
    onInputEnter?.();
    if (isDefined(inputRef) && 'current' in inputRef) {
      setIsFocused(false);
    }
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: instanceId,
    dependencies: [handleEscape],
    options: {
      preventDefault: false,
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnter,
    focusId: instanceId,
    dependencies: [handleEnter],
    options: {
      preventDefault: false,
    },
  });

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
