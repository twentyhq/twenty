import { styled } from '@linaria/react';
import { type ComponentProps, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.li`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  font-size: ${({ onClick }) =>
    onClick ? themeCssVariables.font.size.sm : themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  border-top-left-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[1]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  height: ${themeCssVariables.spacing[6]};

  user-select: none;

  &:hover {
    background: ${({ onClick }) =>
      onClick ? themeCssVariables.background.transparent.light : 'none'};
  }

  flex-shrink: 0;
`;

const StyledChildrenWrapper = styled.span`
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledEndComponent = styled.div`
  display: inline-flex;
  color: ${themeCssVariables.font.color.tertiary};
  margin-left: auto;
  margin-right: 0;

  & > svg {
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
  testId?: string;
  className?: string;
  StartComponent?: React.ReactNode;
  EndComponent?: React.ReactNode;
};

export const DropdownMenuHeader = ({
  children,
  StartComponent,
  onClick,
  testId,
  className,
  EndComponent,
}: DropdownMenuHeaderProps) => {
  return (
    <StyledHeader data-testid={testId} className={className} onClick={onClick}>
      {isDefined(StartComponent) && StartComponent}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {isDefined(EndComponent) && (
        <StyledEndComponent>{EndComponent}</StyledEndComponent>
      )}
    </StyledHeader>
  );
};
