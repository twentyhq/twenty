import { styled } from '@linaria/react';
import { type ComponentProps, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeader = styled.li`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-top-left-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  border-top-right-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: content-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  flex-shrink: 0;
  font-size: ${({ onClick }) =>
    onClick ? themeCssVariables.font.size.sm : themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};

  height: ${themeCssVariables.spacing[6]};

  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${({ onClick }) =>
      onClick ? themeCssVariables.background.transparent.light : 'none'};
  }

  user-select: none;
`;

const StyledChildrenWrapper = styled.span`
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
  testId?: string;
  className?: string;
  StartComponent?: React.ReactNode;
};

export const DropdownMenuHeader = ({
  children,
  StartComponent,
  onClick,
  testId,
  className,
}: DropdownMenuHeaderProps) => {
  return (
    <StyledHeader data-testid={testId} className={className} onClick={onClick}>
      {isDefined(StartComponent) && StartComponent}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
    </StyledHeader>
  );
};
