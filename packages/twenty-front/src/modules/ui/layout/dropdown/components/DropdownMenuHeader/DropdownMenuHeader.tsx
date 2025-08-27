import styled from '@emotion/styled';
import { type ComponentProps, type MouseEvent } from 'react';

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

  height: ${({ theme }) => theme.spacing(6)};

  user-select: none;

  &:hover {
    background: ${({ theme, onClick }) =>
      onClick ? theme.background.transparent.light : 'none'};
  }

  flex-shrink: 0;
`;

const StyledChildrenWrapper = styled.span`
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledEndComponent = styled.div`
  display: inline-flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: auto;
  margin-right: 0;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
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
      {StartComponent && StartComponent}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {EndComponent && <StyledEndComponent>{EndComponent}</StyledEndComponent>}
    </StyledHeader>
  );
};
