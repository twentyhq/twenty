import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ChangeEvent, FocusEvent, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import {
  IconComponent,
  isDefined,
  TablerIconsProps,
  TEXT_INPUT_STYLE,
} from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

type NavigationDrawerInputProps = {
  className?: string;
  Icon?: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: (value: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, value: string) => void;
  hotkeyScope: string;
};

const StyledItem = styled.div<{ isNavigationDrawerExpanded: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: content-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: calc(${({ theme }) => theme.spacing(5)} - 2px);
  padding: ${({ theme }) => theme.spacing(1)};
  text-decoration: none;
  user-select: none;
`;

const StyledItemElementsContainer = styled.span`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  display: flex;
  width: 100%;
`;

const StyledTextInput = styled.input`
  ${TEXT_INPUT_STYLE}
  margin: 0;
  width: 100%;
  padding: 0;
`;

export const NavigationDrawerInput = ({
  className,
  Icon,
  value,
  onChange,
  onSubmit,
  onCancel,
  onClickOutside,
  hotkeyScope,
}: NavigationDrawerInputProps) => {
  const theme = useTheme();
  const [isNavigationDrawerExpanded] = useRecoilState(
    isNavigationDrawerExpandedState,
  );
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
  };

  return (
    <StyledItem
      className={className}
      isNavigationDrawerExpanded={isNavigationDrawerExpanded}
    >
      <StyledItemElementsContainer>
        {Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.md}
            color="currentColor"
          />
        )}
        <NavigationDrawerAnimatedCollapseWrapper>
          <StyledTextInput
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            autoFocus
          />
        </NavigationDrawerAnimatedCollapseWrapper>
      </StyledItemElementsContainer>
    </StyledItem>
  );
};
