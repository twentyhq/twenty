import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { ExpandableInputInstanceContext } from '@/ui/input/states/contexts/ExpandableInputInstanceContext';
import { isExpandableInputOpenedComponentState } from '@/ui/input/states/isExpandableInputOpenedComponentState';
import { useOpenEditableBreadCrumbItem } from '@/ui/navigation/bread-crumb/hooks/useOpenEditableBreadCrumbItem';
import { EditableBreadcrumbItemHotkeyScope } from '@/ui/navigation/bread-crumb/types/EditableBreadcrumbItemHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

type ExpandableInputProps = {
  className?: string;
  defaultValue: string;
  noValuePlaceholder?: string;
  placeholder: string;
  onSubmit: (value: string) => void;
  hotkeyScope: string;
};

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

export const ExpandableInput = ({
  className,
  defaultValue,
  noValuePlaceholder,
  placeholder,
  onSubmit,
}: ExpandableInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const expandableInputInstanceId = useAvailableComponentInstanceIdOrThrow(
    ExpandableInputInstanceContext,
  );

  const [isExpandableInputOpened, setIsExpandableInputOpened] =
    useRecoilComponentStateV2(
      isExpandableInputOpenedComponentState,
      expandableInputInstanceId,
    );

  // TODO: remove this and set the hokey scopes synchronously on page change inside the useNavigateApp hook
  useHotkeyScopeOnMount(
    EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      setIsExpandableInputOpened(false);
    },
    EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
  );

  useScopedHotkeys(
    [Key.Enter],
    () => {
      onSubmit(value);
      setIsExpandableInputOpened(false);
    },
    EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
  );

  const clickOutsideRefs: Array<React.RefObject<HTMLElement>> = [
    inputRef,
    buttonRef,
  ];

  useListenClickOutside({
    refs: clickOutsideRefs,
    callback: () => {
      setIsExpandableInputOpened(false);
    },
    listenerId: 'editable-breadcrumb-item',
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
  };

  const [value, setValue] = useState<string>(defaultValue);

  const { openEditableBreadCrumbItem } = useOpenEditableBreadCrumbItem();

  return isExpandableInputOpened ? (
    <TextInputV2
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
    <StyledButton ref={buttonRef} onClick={openEditableBreadCrumbItem}>
      {value || noValuePlaceholder}
    </StyledButton>
  );
};
