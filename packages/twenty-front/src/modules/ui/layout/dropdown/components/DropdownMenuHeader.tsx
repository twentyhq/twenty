import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ComponentProps, MouseEvent } from 'react';
import { IconComponent, isDefined, LightIconButton } from 'twenty-ui';

const StyledHeader = styled.li`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  font-size: ${({ theme, onClick }) =>
    onClick ? theme.font.size.sm : theme.font.size.md};
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
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledNonClickableStartIcon = styled.div`
  align-items: center;
  background: transparent;
  border: none;

  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;

  white-space: nowrap;
  height: 24px;
  width: 24px;
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  StartIcon?: IconComponent;
  EndIcon?: IconComponent;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
  className?: string;
};

export const DropdownMenuHeader = ({
  children,
  StartIcon,
  EndIcon,
  onClick,
  testId,
  className,
}: DropdownMenuHeaderProps) => {
  const theme = useTheme();
  return (
    <>
      {EndIcon && (
        <StyledHeader
          data-testid={testId}
          onClick={onClick}
          className={className}
        >
          <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
          <StyledEndIcon>
            <EndIcon size={theme.icon.size.md} />
          </StyledEndIcon>
        </StyledHeader>
      )}
      {StartIcon && (
        <StyledHeader data-testid={testId} className={className}>
          {isDefined(onClick) ? (
            <LightIconButton
              testId="dropdown-menu-header-end-icon"
              Icon={StartIcon}
              accent="tertiary"
              size="small"
              onClick={onClick}
            />
          ) : (
            <StyledNonClickableStartIcon>
              <StartIcon
                size={theme.icon.size.sm}
                color={theme.font.color.tertiary}
              />
            </StyledNonClickableStartIcon>
          )}
          <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
        </StyledHeader>
      )}
    </>
  );
};
