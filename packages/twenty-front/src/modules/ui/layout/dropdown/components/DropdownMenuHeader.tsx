import { ComponentProps, MouseEvent } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

const StyledHeader = styled.li`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  padding: ${({ theme }) => theme.spacing(1)};

  user-select: none;

  &:hover {
    background: ${({ theme, onClick }) =>
      onClick ? theme.background.transparent.light : 'none'};
  }
`;

const StyledEndIcon = styled.div`
  display: inline-flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
  margin-right: 0;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

const StyledChildrenWrapper = styled.span`
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  StartIcon?: IconComponent;
  EndIcon?: IconComponent;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
};

export const DropdownMenuHeader = ({
  children,
  StartIcon,
  EndIcon,
  onClick,
  testId,
}: DropdownMenuHeaderProps) => {
  const theme = useTheme();
  return (
    <>
      {EndIcon && (
        <StyledHeader data-testid={testId} onClick={onClick}>
          <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
          <StyledEndIcon>
            <EndIcon size={theme.icon.size.md} />
          </StyledEndIcon>
        </StyledHeader>
      )}
      {StartIcon && (
        <StyledHeader data-testid={testId}>
          <LightIconButton
            testId="dropdown-menu-header-end-icon"
            Icon={StartIcon}
            accent="tertiary"
            size="small"
            onClick={onClick}
          />
          <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
        </StyledHeader>
      )}
    </>
  );
};
