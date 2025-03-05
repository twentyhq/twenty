import styled from '@emotion/styled';
import { ComponentProps, MouseEvent, ReactElement } from 'react';
import { Avatar, AvatarProps, IconComponent } from 'twenty-ui';
import { DropdownMenuHeaderStartIcon } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderStartIcon';
import { isDefined } from 'twenty-shared';
import {
  DropdownMenuHeaderEndIcon,
  DropdownMenuHeaderEndIconProps,
} from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderEndIcon';
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

const StyledChildrenWrapper = styled.span`
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  EndIcon?: IconComponent;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onStartIconClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
  className?: string;
} & (
    | { StartIcon?: IconComponent }
    | { StartAvatar?: ReactElement<AvatarProps, typeof Avatar> }
  ) &
  Omit<DropdownMenuHeaderEndIconProps, 'EndIcon'>;

export const DropdownMenuHeader = ({
  children,
  EndIcon,
  onStartIconClick,
  testId,
  className,
  ...props
}: DropdownMenuHeaderProps) => {
  return (
    <StyledHeader data-testid={testId} className={className}>
      {'StartIcon' in props && isDefined(props.StartIcon) && (
        <DropdownMenuHeaderStartIcon
          onClick={onStartIconClick}
          StartIcon={props.StartIcon}
        />
      )}
      {'StartAvatar' in props && isDefined(props.StartAvatar) && (
        <DropdownMenuHeaderStartIcon
          onClick={onStartIconClick}
          StartAvatar={props.StartAvatar}
        />
      )}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {isDefined(EndIcon) && <DropdownMenuHeaderEndIcon EndIcon={EndIcon} />}
    </StyledHeader>
  );
};
