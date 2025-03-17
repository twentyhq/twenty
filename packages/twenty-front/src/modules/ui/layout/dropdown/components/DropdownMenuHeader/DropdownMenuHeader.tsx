import styled from '@emotion/styled';
import { ComponentProps, MouseEvent, ReactElement } from 'react';
import { Avatar, AvatarProps, IconComponent } from 'twenty-ui';
import { DropdownMenuHeaderStartIcon } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderStartIcon';
import { isDefined } from 'twenty-shared';
import { useTheme } from '@emotion/react';
import {
  Dropdown,
  DropdownProps,
} from '@/ui/layout/dropdown/components/Dropdown';

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
  padding: ${({ theme }) => theme.spacing(1)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  user-select: none;

  &:hover {
    background: ${({ theme, onClick }) =>
      onClick ? theme.background.transparent.light : 'none'};
  }
`;

const StyledChildrenWrapper = styled.span`
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
  text-overflow: ellipsis;
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

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  EndIcon?: IconComponent;
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
  onStartIconClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
  className?: string;
  DropdownOnEndIcon?: ReactElement<DropdownProps, typeof Dropdown>;
} & (
    | { StartIcon?: IconComponent }
    | { StartAvatar?: ReactElement<AvatarProps, typeof Avatar> }
  );
export const DropdownMenuHeader = ({
  children,
  EndIcon,
  onStartIconClick,
  onClick,
  testId,
  className,
  ...props
}: DropdownMenuHeaderProps) => {
  const theme = useTheme();

  return (
    <StyledHeader data-testid={testId} className={className} onClick={onClick}>
      {'StartIcon' in props && isDefined(props.StartIcon) && (
        <DropdownMenuHeaderStartIcon
          onClick={onStartIconClick}
          StartIcon={props.StartIcon}
        />
      )}
      {!('StartIcon' in props) &&
        'StartAvatar' in props &&
        isDefined(props.StartAvatar) && (
          <DropdownMenuHeaderStartIcon
            onClick={onStartIconClick}
            StartAvatar={props.StartAvatar}
          />
        )}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {'DropdownOnEndIcon' in props && (
        <StyledEndIcon>{props.DropdownOnEndIcon}</StyledEndIcon>
      )}
      {!('DropdownOnEndIcon' in props) && EndIcon && (
        <StyledEndIcon>
          <EndIcon size={theme.icon.size.md} />
        </StyledEndIcon>
      )}
    </StyledHeader>
  );
};
