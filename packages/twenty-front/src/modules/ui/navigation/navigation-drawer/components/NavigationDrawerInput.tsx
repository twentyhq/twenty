import { TextInput } from '@/ui/field/input/components/TextInput';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { IconComponent, TablerIconsProps } from 'twenty-ui';

type NavigationDrawerInputProps = {
  className?: string;
  Icon: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: (value: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, value: string) => void;
  hotkeyScope: string;
};

const StyledItem = styled.div<{ isNavigationDrawerExpanded: boolean }>`
  align-items: center;
  background: inherit;
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
  display: flex;
  width: 100%;
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
          <TextInput
            value={value}
            onChange={onChange}
            onEnter={onSubmit}
            onEscape={onCancel}
            onClickOutside={onClickOutside}
            hotkeyScope={hotkeyScope}
            copyButton={false}
            autoFocus
          />
        </NavigationDrawerAnimatedCollapseWrapper>
      </StyledItemElementsContainer>
    </StyledItem>
  );
};
