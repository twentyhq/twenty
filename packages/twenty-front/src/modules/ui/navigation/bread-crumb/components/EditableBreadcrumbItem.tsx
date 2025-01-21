import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { EditableBreadcrumbItemHotkeyScope } from '@/ui/navigation/bread-crumb/types/EditableBreadcrumbItemHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

type EditableBreadcrumbItemProps = {
  isRenaming: boolean;
  className?: string;
  setIsRenaming: (isRenaming: boolean) => void;
  defaultValue: string;
  placeholder: string;
  onSubmit: (value: string) => void;
  onCancel: (value: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, value: string) => void;
  hotkeyScope: string;
};

const StyledInput = styled(TextInputV2)`
  background-color: white;
`;

const StyledButton = styled('button')`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: content-box;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 20px;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const EditableBreadcrumbItem = ({
  className,
  isRenaming,
  setIsRenaming,
  defaultValue,
  placeholder,
  onSubmit,
  onCancel,
  onClickOutside,
}: EditableBreadcrumbItemProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useHotkeyScopeOnMount(
    EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onCancel(value);
    },
    EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
  );

  useScopedHotkeys(
    [Key.Enter],
    () => {
      onSubmit(value);
    },
    EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
  );

  const clickOutsideRefs: Array<React.RefObject<HTMLElement>> = [
    inputRef,
    buttonRef,
  ];

  useListenClickOutside({
    refs: clickOutsideRefs,
    callback: (event) => {
      onClickOutside(event, value);
    },
    listenerId: 'editable-breadcrumb-item',
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
  };

  const [value, setValue] = useState<string>(defaultValue);

  return isRenaming ? (
    <StyledInput
      className={className}
      autoGrow
      sizeVariant="sm"
      ref={inputRef}
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      onFocus={handleFocus}
      autoFocus
    />
  ) : (
    <StyledButton ref={buttonRef} onClick={() => setIsRenaming(true)}>
      {value}
    </StyledButton>
  );
};
