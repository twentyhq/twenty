import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { FocusEvent, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent, TablerIconsProps } from 'twenty-ui/display';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

type NavigationDrawerInputProps = {
  className?: string;
  Icon?: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: (value: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, value: string) => void;
  hotkeyScope: string;
};

export const NavigationDrawerInput = ({
  className,
  placeholder,
  Icon,
  value,
  onChange,
  onSubmit,
  onCancel,
  onClickOutside,
  hotkeyScope,
}: NavigationDrawerInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeyScopeOnMount(hotkeyScope);

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onCancel(value);
    },
    hotkeyScope,
  );

  useScopedHotkeys(
    [Key.Enter],
    () => {
      onSubmit(value);
    },
    hotkeyScope,
  );

  useListenClickOutside({
    refs: [inputRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      onClickOutside(event, value);
    },
    listenerId: 'navigation-drawer-input',
  });

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
  };

  return (
    <TextInputV2
      className={className}
      LeftIcon={Icon}
      ref={inputRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={handleFocus}
      sizeVariant="md"
      fullWidth
      autoFocus
    />
  );
};
