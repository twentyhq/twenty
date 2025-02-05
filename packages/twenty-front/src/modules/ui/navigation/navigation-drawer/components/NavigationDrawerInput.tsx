import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import styled from '@emotion/styled';
import { FocusEvent, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared';
import { IconComponent, TablerIconsProps } from 'twenty-ui';
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

const StyledInput = styled(TextInputV2)`
  background-color: white;
`;

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
    <StyledInput
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
