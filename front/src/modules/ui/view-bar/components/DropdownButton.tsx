import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { DropdownMenuContainer } from './DropdownMenuContainer';

type DropdownButtonProps = {
  anchor?: 'left' | 'right';
  label: ReactNode;
  isActive: boolean;
  children?: ReactNode;
  isUnfolded?: boolean;
  Icon?: IconComponent;
  onIsUnfoldedChange?: (newIsUnfolded: boolean) => void;
  resetState?: () => void;
  hotkeyScope: string;
  color?: string;
  menuWidth?: `${string}px` | 'auto' | number;
};

const StyledDropdownButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDropdownButtonIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive: boolean;
};

const StyledDropdownButton = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme, color }) =>
    color ?? (isActive ? theme.color.blue : 'none')};
  cursor: pointer;
  display: flex;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  &:hover {
    filter: brightness(0.95);
  }
`;

/**
 *
 * @deprecated use ui/dropdown/components/DropdownButton.tsx instead
 */
function DropdownButton({
  anchor,
  label,
  isActive,
  children,
  isUnfolded = false,
  onIsUnfoldedChange,
  Icon,
  hotkeyScope,
  color,
  menuWidth,
}: DropdownButtonProps) {
  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    () => {
      onIsUnfoldedChange?.(false);
    },
    hotkeyScope,
    [onIsUnfoldedChange],
  );

  const onButtonClick = () => {
    onIsUnfoldedChange?.(!isUnfolded);
  };

  const onOutsideClick = () => {
    onIsUnfoldedChange?.(false);
  };

  const theme = useTheme();

  return (
    <StyledDropdownButtonContainer>
      <StyledDropdownButton
        isUnfolded={isUnfolded}
        onClick={onButtonClick}
        isActive={isActive}
        aria-selected={isActive}
        color={color}
      >
        {Icon && (
          <StyledDropdownButtonIcon>
            {<Icon size={theme.icon.size.md} />}
          </StyledDropdownButtonIcon>
        )}
        {label}
      </StyledDropdownButton>
      {isUnfolded && (
        <DropdownMenuContainer
          width={menuWidth}
          anchor={anchor}
          onClose={onOutsideClick}
        >
          {children}
        </DropdownMenuContainer>
      )}
    </StyledDropdownButtonContainer>
  );
}

export default DropdownButton;
