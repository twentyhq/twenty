import styled from '@emotion/styled';
import { ComponentProps, MouseEvent, ReactElement, ReactNode } from 'react';
import { Avatar, AvatarProps, IconComponent } from 'twenty-ui';
import { DropdownMenuHeaderStartIcon } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderStartIcon';
import { isDefined } from 'twenty-shared';
import { DropdownMenuHeaderWithDropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderWithDropdownMenu';
import { useTheme } from '@emotion/react';
import { Placement } from '@floating-ui/react';

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
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onStartIconClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
  className?: string;
} & (
    | { StartIcon?: IconComponent }
    | { StartAvatar?: ReactElement<AvatarProps, typeof Avatar> }
  ) &
  (
    | {
        dropdownId: string;
        dropdownPlacement: Placement;
        dropdownComponents: ReactNode;
      }
    | Record<never, never>
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
      {'StartAvatar' in props && isDefined(props.StartAvatar) && (
        <DropdownMenuHeaderStartIcon
          onClick={onStartIconClick}
          StartAvatar={props.StartAvatar}
        />
      )}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {'dropdownId' in props && (
        <StyledEndIcon>
          <DropdownMenuHeaderWithDropdownMenu
            EndIcon={EndIcon}
            dropdownId={props.dropdownId}
            dropdownPlacement={props.dropdownPlacement}
            dropdownComponents={props.dropdownComponents}
          />
        </StyledEndIcon>
      )}
      {!('dropdownId' in props) && EndIcon && (
        <StyledEndIcon>
          <EndIcon size={theme.icon.size.md} />
        </StyledEndIcon>
      )}
    </StyledHeader>
  );
};
